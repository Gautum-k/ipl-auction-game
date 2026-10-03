import { describe, expect, it } from 'vitest';
import { AuctionEngine } from '../src/engine/auctionEngine';
import { AuctionRoomState } from '../src/types';

describe('Phase 12.5: MongoDB Room Snapshot Persistence & Server Restart Simulation', () => {
  it('should serialize, restore room snapshot, and guarantee sold players never re-enter', () => {
    // 1. Initial Room setup
    let room = AuctionEngine.createInitialRoom('PERSIST1', 'Persistence Test Room', 'socket_host_1');
    room.phase = 'BIDDING';
    room.teams['CSK'].ownerSocketId = 'socket_csk';
    room.teams['MI'].ownerSocketId = 'socket_mi';

    // 2. Perform auction activity (Sell 3 players to CSK, leave 2 unsold)
    for (let i = 0; i < 3; i++) {
      room = AuctionEngine.finalizeSale(room, 'CSK', 2_00_00_000, false);
      room = AuctionEngine.advanceToNextPlayer(room); // BIDDING
    }

    for (let i = 0; i < 2; i++) {
      room = AuctionEngine.finalizeUnsold(room);
      room = AuctionEngine.advanceToNextPlayer(room); // BIDDING
    }

    expect(room.soldPlayers.length).toBe(3);
    expect(room.unsoldPlayers.length).toBe(2);
    const originalSoldIds = room.soldPlayers.map((s) => s.player.id);
    const originalSetIndex = room.currentSetIndex;
    const originalPlayerIndex = room.currentPlayerIndex;

    // 3. Simulate MongoDB JSON serialization / deserialization dump (Server restart simulation)
    const snapshotJson = JSON.stringify(room);
    const rehydratedRoom: AuctionRoomState = JSON.parse(snapshotJson);

    // 4. Assert restored state match
    expect(rehydratedRoom.roomCode).toBe('PERSIST1');
    expect(rehydratedRoom.soldPlayers.length).toBe(3);
    expect(rehydratedRoom.unsoldPlayers.length).toBe(2);
    expect(rehydratedRoom.currentSetIndex).toBe(originalSetIndex);
    expect(rehydratedRoom.currentPlayerIndex).toBe(originalPlayerIndex);

    // 5. Run accelerated round on rehydrated state and assert zero sold players can be drawn
    const unsoldIds = rehydratedRoom.unsoldPlayers.map((p) => p.id);
    const acceleratedRoom = AuctionEngine.startAcceleratedRound(rehydratedRoom, unsoldIds);

    const acceleratedPlayerIds = acceleratedRoom.playerPool.map((p) => p.id);
    for (const soldId of originalSoldIds) {
      expect(acceleratedPlayerIds).not.toContain(soldId);
    }
  });

  it('should persist and rehydrate Phase 13 state fields: unsoldPool, nominations, accelList, nominationDoneTeams, and accelNominationDeadline', () => {
    const room = AuctionEngine.createInitialRoom('PERSIST_P13', 'Phase 13 Persistence Room', 'socket_host_13');
    room.phase = 'ACCEL_NOMINATION';
    room.unsoldPool = ['p_u1', 'p_u2', 'p_u3'];
    room.nominations = {
      CSK: ['p_u1', 'p_u2'],
      MI: ['p_u2', 'p_u3'],
    };
    room.accelList = ['p_u1', 'p_u2', 'p_u3'];
    room.nominationDoneTeams = ['CSK'];
    room.accelNominationDeadline = Date.now() + 60_000;

    // Simulate MongoDB serialization / deserialization
    const dbDumpJson = JSON.stringify(room);
    const restoredRoom: AuctionRoomState = JSON.parse(dbDumpJson);

    expect(restoredRoom.roomCode).toBe('PERSIST_P13');
    expect(restoredRoom.phase).toBe('ACCEL_NOMINATION');
    expect(restoredRoom.unsoldPool).toEqual(['p_u1', 'p_u2', 'p_u3']);
    expect(restoredRoom.nominations).toEqual({
      CSK: ['p_u1', 'p_u2'],
      MI: ['p_u2', 'p_u3'],
    });
    expect(restoredRoom.accelList).toEqual(['p_u1', 'p_u2', 'p_u3']);
    expect(restoredRoom.nominationDoneTeams).toEqual(['CSK']);
    expect(restoredRoom.accelNominationDeadline).toBeDefined();
  });
});
