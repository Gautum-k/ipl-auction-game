import { Server as SocketIOServer, Socket } from 'socket.io';
import { INITIAL_PLAYER_DATASET } from '../data/players';
import { AuctionEngine } from '../engine/auctionEngine';
import { BotEngine } from '../engine/botEngine';
import { connectToDatabase } from '../lib/db';
import { generateRoomCode, sanitizeDisplayName } from '../lib/roomCode';
import { AuctionRoomModel } from '../models/AuctionRoomModel';
import { AuctionRoomState, Player } from '../types';
import { logger } from '../lib/logger';

// In-memory store for fast socket execution & timer loops
const roomsInMemory: Record<string, AuctionRoomState> = {};
const roomTimers: Record<string, NodeJS.Timeout> = {};

// Socket rate limiter: maps socketId -> timestamps of actions within window
const socketRateLimits: Record<string, number[]> = {};

function isRateLimited(socketId: string, maxRequests = 10, windowMs = 1000): boolean {
  const now = Date.now();
  if (!socketRateLimits[socketId]) {
    socketRateLimits[socketId] = [];
  }
  socketRateLimits[socketId] = socketRateLimits[socketId].filter((t) => now - t < windowMs);
  if (socketRateLimits[socketId].length >= maxRequests) {
    return true;
  }
  socketRateLimits[socketId].push(now);
  return false;
}

/**
 * Persist room state to MongoDB asynchronously without blocking real-time WebSocket ticks
 */
async function persistRoomState(roomState: AuctionRoomState): Promise<void> {
  try {
    await connectToDatabase();
    await AuctionRoomModel.findOneAndUpdate(
      { roomCode: roomState.roomCode },
      { ...roomState, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn(`[DB Persist Warning] Could not persist room ${roomState.roomCode}:`, (err as Error).message);
  }
}

/**
 * Rehydrate all rooms from MongoDB on server boot/restart
 */
export async function rehydrateRoomsFromDatabase(io: SocketIOServer): Promise<void> {
  try {
    await connectToDatabase();
    const roomsFromDb = await AuctionRoomModel.find({});
    console.log(`🔄 Rehydrating ${roomsFromDb.length} room(s) from MongoDB persistence...`);

    for (const doc of roomsFromDb) {
      const room = doc.toObject() as unknown as AuctionRoomState;
      roomsInMemory[room.roomCode] = room;

      // If timer was running when server slept/restarted, re-arm timer loop
      if (
        room.timer.isRunning &&
        (room.phase === 'BIDDING' ||
          room.phase === 'RTM_PENDING' ||
          room.phase === 'ACCEL_NOMINATION' ||
          room.phase === 'ACCEL_BIDDING')
      ) {
        startRoomTimerLoop(io, room.roomCode);
      }
    }
    console.log('✅ Room rehydration complete.');
  } catch (err) {
    console.warn('⚠️ Could not rehydrate rooms from MongoDB (running in memory-only mode):', (err as Error).message);
  }
}

/**
 * 1-second server timer tick loop for an active room
 */
function startRoomTimerLoop(io: SocketIOServer, roomCode: string) {
  if (roomTimers[roomCode]) {
    clearInterval(roomTimers[roomCode]);
  }

  roomTimers[roomCode] = setInterval(() => {
    const room = roomsInMemory[roomCode];
    if (!room || !room.timer.isRunning) {
      if (roomTimers[roomCode]) clearInterval(roomTimers[roomCode]);
      return;
    }

    // AI Bot Bidding Evaluation
    if (room.phase === 'BIDDING' || room.phase === 'ACCEL_BIDDING') {
      const botDecision = BotEngine.evaluateBotBids(room);
      if (botDecision.shouldBid && botDecision.teamId) {
        try {
          const nextState = AuctionEngine.placeBid(room, botDecision.teamId, botDecision.amount);
          roomsInMemory[roomCode] = nextState;
          io.to(roomCode).emit('room_state', nextState);
          io.to(roomCode).emit('bid_sound', { teamId: botDecision.teamId, amount: nextState.currentBid });
        } catch {
          // Ignore bot bid validation edge cases
        }
      }
    }

    if (room.timer.secondsLeft > 1) {
      room.timer.secondsLeft -= 1;
      io.to(roomCode).emit('timer_tick', { secondsLeft: room.timer.secondsLeft });
    } else {
      // Timer expired!
      room.timer.secondsLeft = 0;
      let nextState = room;

      if (room.phase === 'ACCEL_NOMINATION') {
        nextState = BotEngine.evaluateBotNominations(room);
        nextState = AuctionEngine.startAcceleratedRound(nextState);
        if (nextState.phase === 'ACCEL_BIDDING') {
          startRoomTimerLoop(io, roomCode);
        }
      } else {
        nextState = AuctionEngine.handleTimerExpiry(room);
      }

      roomsInMemory[roomCode] = nextState;

      io.to(roomCode).emit('room_state', nextState);
      persistRoomState(nextState);

      if (!nextState.timer.isRunning) {
        clearInterval(roomTimers[roomCode]);
      }
    }
  }, 1000);
}

// Room creation rate limiter per socket ID (min 2s interval)
const roomCreateRateLimits: Record<string, number> = {};

function isRoomCreateRateLimited(socketId: string, minIntervalMs = 2000): boolean {
  const now = Date.now();
  const last = roomCreateRateLimits[socketId] || 0;
  if (now - last < minIntervalMs) {
    return true;
  }
  roomCreateRateLimits[socketId] = now;
  return false;
}

/**
 * Initialize Socket.IO event listeners
 */
export function setupSocketHandler(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Create Room
    socket.on(
      'create_room',
      async ({
        roomName,
        hostName,
        sessionToken,
        mode = 'MEGA_2025',
        roomSize = 10,
        timerLength = 15,
        fillWithBots = false,
      }: {
        roomName: string;
        hostName: string;
        sessionToken?: string;
        mode?: 'MEGA_2025' | 'MINI_2026';
        roomSize?: number;
        timerLength?: number;
        fillWithBots?: boolean;
      }) => {
        const t0 = performance.now();

        if (isRoomCreateRateLimited(socket.id)) {
          logger.warn(`Room creation rate limited for socket ${socket.id}`, 'RoomCreate');
          socket.emit('error_msg', 'Room creation rate limit exceeded. Please wait a moment before creating another room.');
          return;
        }

        const nameSanitized = sanitizeDisplayName(hostName);
        if (!nameSanitized.valid) {
          socket.emit('error_msg', nameSanitized.error);
          return;
        }

        // (a) Room code generation timing
        const tCodeGenStart = performance.now();
        let code = generateRoomCode();
        let collisionAttempts = 0;
        while (roomsInMemory[code] && collisionAttempts < 100) {
          code = generateRoomCode();
          collisionAttempts++;
        }
        const tCodeGen = performance.now() - tCodeGenStart;

        // (e) Player pool query & initial state timing
        const tEngineStart = performance.now();
        const newRoom = AuctionEngine.createInitialRoom(
          code,
          roomName || 'IPL Mega Auction',
          socket.id,
          sessionToken || socket.id,
          { mode, roomSize, timerLength, fillWithBots }
        );
        const tEngine = performance.now() - tEngineStart;

        // (c) Socket.IO room join timing
        const tJoinStart = performance.now();
        roomsInMemory[code] = newRoom;
        socket.join(code);
        const tJoin = performance.now() - tJoinStart;

        // (d) Initial state broadcast timing
        const tBroadcastStart = performance.now();
        socket.emit('room_created', { roomCode: code, state: newRoom });
        io.to(code).emit('room_state', newRoom);
        const tBroadcast = performance.now() - tBroadcastStart;

        const tSyncTotal = performance.now() - t0;

        // (b) MongoDB async persistence timing
        const tDbStart = performance.now();
        persistRoomState(newRoom).then(() => {
          const tDb = performance.now() - tDbStart;
          logger.info(
            `[RoomCreate Timing] ${code} -> CodeGen: ${tCodeGen.toFixed(2)}ms | EngineInit: ${tEngine.toFixed(2)}ms | SocketJoin: ${tJoin.toFixed(2)}ms | Broadcast: ${tBroadcast.toFixed(2)}ms | SyncResponseTotal: ${tSyncTotal.toFixed(2)}ms | AsyncDbPersist: ${tDb.toFixed(2)}ms`,
            'RoomCreate'
          );
        });
      }
    );

    // Join Room
    socket.on(
      'join_room',
      async ({ roomCode, sessionToken, userName }: { roomCode: string; sessionToken?: string; userName?: string }) => {
        const code = roomCode.toUpperCase();
        let room = roomsInMemory[code];

        if (!room) {
          try {
            await connectToDatabase();
            const doc = await AuctionRoomModel.findOne({ roomCode: code });
            if (doc) {
              room = doc.toObject() as unknown as AuctionRoomState;
              roomsInMemory[code] = room;
            }
          } catch (e) {
            console.warn('DB lookup error:', (e as Error).message);
          }
        }

        if (!room) {
          socket.emit('error_msg', 'Room not found. Please check your room code.');
          return;
        }

        // Reclaim seat if sessionToken matches a claimed team!
        if (sessionToken) {
          Object.values(room.teams).forEach((t) => {
            if (t.ownerSessionToken === sessionToken) {
              if (t.ownerSocketId && t.ownerSocketId !== socket.id) {
                io.to(t.ownerSocketId).emit('session_replaced', 'Your seat was taken over by a newer browser tab.');
              }
              t.ownerSocketId = socket.id;
            }
          });
        }

        // Add to spectators if not claiming a team
        if (userName) {
          const sanitized = sanitizeDisplayName(userName);
          if (sanitized.valid && !room.spectators.some((s) => s.socketId === socket.id)) {
            room.spectators.push({
              socketId: socket.id,
              sessionToken: sessionToken || socket.id,
              name: sanitized.name,
            });
          }
        }

        socket.join(code);
        socket.emit('room_state', room);
      }
    );

    // Claim Team
    socket.on(
      'claim_team',
      async ({
        roomCode,
        teamId,
        ownerName,
        sessionToken,
      }: {
        roomCode: string;
        teamId: string;
        ownerName: string;
        sessionToken?: string;
      }) => {
        const room = roomsInMemory[roomCode.toUpperCase()];
        if (!room) return;

        const nameSanitized = sanitizeDisplayName(ownerName);
        if (!nameSanitized.valid) {
          socket.emit('error_msg', nameSanitized.error);
          return;
        }

        const team = room.teams[teamId];
        if (!team) return;

        // Update team ownership and bind session token
        team.ownerSocketId = socket.id;
        team.ownerSessionToken = sessionToken || socket.id;
        team.ownerName = nameSanitized.name;

        // Remove from spectators if claimed team
        room.spectators = room.spectators.filter((s) => s.socketId !== socket.id);

        roomsInMemory[room.roomCode] = { ...room, updatedAt: Date.now() };

        io.to(room.roomCode).emit('room_state', roomsInMemory[room.roomCode]);
        persistRoomState(roomsInMemory[room.roomCode]);
      }
    );

    // Unclaim Team
    socket.on('unclaim_team', async ({ roomCode, teamId }: { roomCode: string; teamId: string }) => {
      const room = roomsInMemory[roomCode.toUpperCase()];
      if (!room || !room.teams[teamId]) return;

      room.teams[teamId].ownerSocketId = null;
      room.teams[teamId].ownerName = '';
      room.teams[teamId].isReady = false;

      roomsInMemory[room.roomCode] = { ...room, updatedAt: Date.now() };
      io.to(room.roomCode).emit('room_state', roomsInMemory[room.roomCode]);
      persistRoomState(roomsInMemory[room.roomCode]);
    });

    // Start Auction
    socket.on('start_auction', async ({ roomCode }: { roomCode: string }) => {
      const room = roomsInMemory[roomCode.toUpperCase()];
      if (!room) return;

      if (room.phase !== 'LOBBY') {
        socket.emit('error_msg', 'Auction has already started');
        return;
      }

      room.phase = 'BIDDING';
      room.timer.isRunning = true;
      room.timer.secondsLeft = 15;

      roomsInMemory[room.roomCode] = room;
      startRoomTimerLoop(io, room.roomCode);

      io.to(room.roomCode).emit('room_state', room);
      persistRoomState(room);
    });

    // Place Bid
    socket.on('place_bid', async ({ roomCode, teamId, amount }: { roomCode: string; teamId: string; amount?: number }) => {
      if (isRateLimited(socket.id)) {
        socket.emit('error_msg', 'Rate limit exceeded. Please wait a moment before bidding again.');
        return;
      }

      if (!roomCode || typeof roomCode !== 'string' || !teamId || typeof teamId !== 'string') {
        socket.emit('error_msg', 'Invalid bid request parameters.');
        return;
      }

      const room = roomsInMemory[roomCode.toUpperCase()];
      if (!room) return;

      try {
        const nextState = AuctionEngine.placeBid(room, teamId, amount);
        roomsInMemory[room.roomCode] = nextState;

        // Ensure timer loop is running
        startRoomTimerLoop(io, room.roomCode);

        io.to(room.roomCode).emit('room_state', nextState);
        io.to(room.roomCode).emit('bid_sound', { teamId, amount: nextState.currentBid });

        persistRoomState(nextState);
      } catch (err) {
        socket.emit('error_msg', (err as Error).message);
      }
    });

    // Exercise RTM
    socket.on('exercise_rtm', async ({ roomCode, teamId, decision }: { roomCode: string; teamId: string; decision: 'ACCEPT' | 'DECLINE' }) => {
      const room = roomsInMemory[roomCode.toUpperCase()];
      if (!room) return;

      try {
        const nextState = AuctionEngine.exerciseRtm(room, teamId, decision);
        roomsInMemory[room.roomCode] = nextState;

        startRoomTimerLoop(io, room.roomCode);

        io.to(room.roomCode).emit('room_state', nextState);
        await persistRoomState(nextState);
      } catch (err) {
        socket.emit('error_msg', (err as Error).message);
      }
    });

    // Toggle Pause
    socket.on('toggle_pause', async ({ roomCode }: { roomCode: string }) => {
      const room = roomsInMemory[roomCode.toUpperCase()];
      if (!room) return;

      if (room.phase === 'PAUSED') {
        room.phase = 'BIDDING';
        room.timer.isRunning = true;
        startRoomTimerLoop(io, room.roomCode);
      } else if (room.phase === 'BIDDING') {
        room.phase = 'PAUSED';
        room.timer.isRunning = false;
        if (roomTimers[room.roomCode]) clearInterval(roomTimers[room.roomCode]);
      }

      roomsInMemory[room.roomCode] = room;
      io.to(room.roomCode).emit('room_state', room);
      await persistRoomState(room);
    });

    // Start Accelerated Round
    socket.on('start_accelerated', async ({ roomCode, selectedUnsoldIds }: { roomCode: string; selectedUnsoldIds?: string[] }) => {
      const room = roomsInMemory[roomCode.toUpperCase()];
      if (!room) return;

      const nextState = AuctionEngine.startAcceleratedRound(room, selectedUnsoldIds);
      roomsInMemory[room.roomCode] = nextState;

      if (nextState.timer.isRunning) {
        startRoomTimerLoop(io, room.roomCode);
      }

      io.to(room.roomCode).emit('room_state', nextState);
      await persistRoomState(nextState);
    });

    // Accelerated Nomination: Nominate Player
    socket.on('accel:nominate', async ({ roomCode, playerId }: { roomCode: string; playerId: string }) => {
      const code = roomCode.toUpperCase();
      const room = roomsInMemory[code];
      if (!room || room.phase !== 'ACCEL_NOMINATION') {
        socket.emit('error_msg', 'Room is not in accelerated nomination phase.');
        return;
      }

      const team = Object.values(room.teams).find((t) => t.ownerSocketId === socket.id);
      if (!team) {
        socket.emit('error_msg', 'Only claimed team owners can nominate players.');
        return;
      }

      const doneTeams = room.nominationDoneTeams || [];
      if (doneTeams.includes(team.teamId)) {
        socket.emit('error_msg', 'Your team has already marked nominations as done.');
        return;
      }

      const unsoldPool = room.unsoldPool || [];
      if (!unsoldPool.includes(playerId)) {
        socket.emit('error_msg', 'Player is not in the unsold pool.');
        return;
      }

      const player =
        INITIAL_PLAYER_DATASET.find((p) => p.id === playerId) ||
        room.playerPool.find((p) => p.id === playerId) ||
        room.unsoldPlayers.find((p) => p.id === playerId);

      if (!player) {
        socket.emit('error_msg', 'Player data not found.');
        return;
      }

      const currentNominated = room.nominations?.[team.teamId] || [];
      if (currentNominated.includes(playerId)) {
        return; // Already nominated
      }

      // Rule 1: Affordability check (purse >= basePrice)
      if (team.purseRemaining < player.basePrice) {
        socket.emit('error_msg', `Cannot afford base price of ₹${player.basePrice / 100000} Lakhs.`);
        return;
      }

      // Rule 2: Max squad limit check (< 25)
      if (team.squad.length + currentNominated.length >= 25) {
        socket.emit('error_msg', 'Maximum squad size limit of 25 reached.');
        return;
      }

      // Rule 3: Overseas cap check (< 8)
      if (player.isOverseas) {
        const knownMap = new Map<string, Player>();
        INITIAL_PLAYER_DATASET.forEach((p) => knownMap.set(p.id, p));
        room.playerPool.forEach((p) => knownMap.set(p.id, p));
        room.unsoldPlayers.forEach((p) => knownMap.set(p.id, p));

        const overseasNominatedCount = currentNominated
          .map((id) => knownMap.get(id))
          .filter((p): p is Player => p !== undefined && p.isOverseas).length;

        const overseasSquadCount = team.squad.filter((p) => p.isOverseas).length;
        if (overseasSquadCount + overseasNominatedCount >= 8) {
          socket.emit('error_msg', 'Maximum overseas limit of 8 reached.');
          return;
        }
      }

      const updatedRoom = {
        ...room,
        nominations: {
          ...(room.nominations || {}),
          [team.teamId]: [...currentNominated, playerId],
        },
        updatedAt: Date.now(),
      };

      roomsInMemory[code] = updatedRoom;
      io.to(code).emit('room_state', updatedRoom);
      await persistRoomState(updatedRoom);
    });

    // Accelerated Nomination: Unnominate Player
    socket.on('accel:unnominate', async ({ roomCode, playerId }: { roomCode: string; playerId: string }) => {
      const code = roomCode.toUpperCase();
      const room = roomsInMemory[code];
      if (!room || room.phase !== 'ACCEL_NOMINATION') return;

      const team = Object.values(room.teams).find((t) => t.ownerSocketId === socket.id);
      if (!team) return;

      const doneTeams = room.nominationDoneTeams || [];
      if (doneTeams.includes(team.teamId)) return;

      const currentNominated = room.nominations?.[team.teamId] || [];
      const updatedNominated = currentNominated.filter((id) => id !== playerId);

      const updatedRoom = {
        ...room,
        nominations: {
          ...(room.nominations || {}),
          [team.teamId]: updatedNominated,
        },
        updatedAt: Date.now(),
      };

      roomsInMemory[code] = updatedRoom;
      io.to(code).emit('room_state', updatedRoom);
      await persistRoomState(updatedRoom);
    });

    // Accelerated Nomination: Team Done
    socket.on('accel:done', async ({ roomCode }: { roomCode: string }) => {
      const code = roomCode.toUpperCase();
      const room = roomsInMemory[code];
      if (!room || room.phase !== 'ACCEL_NOMINATION') return;

      const team = Object.values(room.teams).find((t) => t.ownerSocketId === socket.id);
      if (!team) return;

      const doneTeams = Array.from(new Set([...(room.nominationDoneTeams || []), team.teamId]));
      let updatedRoom: AuctionRoomState = {
        ...room,
        nominationDoneTeams: doneTeams,
        updatedAt: Date.now(),
      };

      // Check if all human teams are done
      const humanTeams = Object.values(updatedRoom.teams).filter((t) => !t.isBot && t.ownerSocketId !== null);
      const allHumansDone = humanTeams.every((t) => doneTeams.includes(t.teamId));

      if (allHumansDone || humanTeams.length === 0) {
        updatedRoom = BotEngine.evaluateBotNominations(updatedRoom);
        updatedRoom = AuctionEngine.startAcceleratedRound(updatedRoom);
        if (updatedRoom.timer.isRunning) {
          startRoomTimerLoop(io, code);
        }
      }

      roomsInMemory[code] = updatedRoom;
      io.to(code).emit('room_state', updatedRoom);
      await persistRoomState(updatedRoom);
    });

    // Accelerated Nomination: Host Force Start Bidding
    socket.on('accel:start_bidding', async ({ roomCode }: { roomCode: string }) => {
      const code = roomCode.toUpperCase();
      const room = roomsInMemory[code];
      if (!room || room.phase !== 'ACCEL_NOMINATION') return;

      if (room.hostSocketId !== socket.id) {
        socket.emit('error_msg', 'Only host can force start accelerated bidding.');
        return;
      }

      let updatedRoom = BotEngine.evaluateBotNominations(room);
      updatedRoom = AuctionEngine.startAcceleratedRound(updatedRoom);
      if (updatedRoom.timer.isRunning) {
        startRoomTimerLoop(io, code);
      }

      roomsInMemory[code] = updatedRoom;
      io.to(code).emit('room_state', updatedRoom);
      await persistRoomState(updatedRoom);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}
