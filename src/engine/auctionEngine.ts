import { IPL_RULES, getNextMinBid } from '../config/rules';
import { INITIAL_PLAYER_DATASET } from '../data/players';
import { AuctionRoomConfig, AuctionRoomState, BidLog, Player, TeamState } from '../types';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  minBidRequired?: number;
}

export class AuctionEngine {
  /**
   * Create an initial room state with standard defaults
   */
  public static createInitialRoom(
    roomCode: string,
    roomName: string,
    hostSocketId: string,
    hostSessionToken: string = 'token_host',
    config: Partial<AuctionRoomConfig> = {}
  ): AuctionRoomState {
    const fullConfig: AuctionRoomConfig = {
      mode: config.mode || 'MEGA_2025',
      roomSize: config.roomSize || 10,
      timerLength: config.timerLength || 15,
      fillWithBots: config.fillWithBots || false,
    };

    const teams: Record<string, TeamState> = {};
    const teamList = IPL_RULES.teamOptions.slice(0, fullConfig.roomSize);

    teamList.forEach((t) => {
      teams[t.id] = {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        ownerSocketId: null,
        ownerSessionToken: null,
        ownerName: '',
        isBot: false,
        purseRemaining: IPL_RULES.maxPursePerTeam,
        squad: [],
        rtmRemaining: IPL_RULES.maxRtmPerTeam,
        isReady: false,
      };
    });

    const pool = AuctionEngine.shufflePoolBySet(INITIAL_PLAYER_DATASET);
    const firstPlayer = pool.length > 0 ? pool[0] : null;

    return {
      roomCode: roomCode.toUpperCase(),
      roomName,
      hostSocketId,
      hostSessionToken,
      config: fullConfig,
      spectators: [],
      phase: 'LOBBY',
      currentSetIndex: firstPlayer ? firstPlayer.setNumber : 1,
      currentPlayerIndex: 0,
      currentPlayer: firstPlayer,
      currentBid: 0,
      highestBidderTeamId: null,
      rtmClaimedByTeamId: null,
      rtmAskingBid: null,
      rtmRaisedPrice: null,
      bidHistory: [],
      teams,
      playerPool: pool,
      soldPlayers: [],
      unsoldPlayers: [],
      unsoldPool: [],
      nominations: {},
      accelList: [],
      nominationDoneTeams: [],
      accelNominationDeadline: undefined,
      acceleratedPool: [],
      isAcceleratedMode: false,
      timer: {
        secondsLeft: fullConfig.timerLength,
        isRunning: false,
        duration: fullConfig.timerLength,
        bidDeadline: Date.now() + fullConfig.timerLength * 1000,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Validate whether a team can place a bid of `amount` on the current player
   */
  public static validateBid(room: AuctionRoomState, teamId: string, amount?: number): ValidationResult {
    if (room.phase !== 'BIDDING') {
      return { valid: false, reason: 'Auction is not in bidding phase' };
    }

    if (!room.currentPlayer) {
      return { valid: false, reason: 'No player is currently up for auction' };
    }

    const team = room.teams[teamId];
    if (!team || !team.ownerSocketId) {
      return { valid: false, reason: 'Team is not claimed or user is not team owner' };
    }

    if (room.highestBidderTeamId === teamId) {
      return { valid: false, reason: 'Your team is already the highest bidder' };
    }

    const minBid = getNextMinBid(room.currentBid, room.currentPlayer.basePrice);
    const bidAmount = amount !== undefined ? amount : minBid;

    if (bidAmount < minBid) {
      return { valid: false, reason: `Bid must be at least ₹${minBid}`, minBidRequired: minBid };
    }

    if (bidAmount > team.purseRemaining) {
      return { valid: false, reason: 'Insufficient purse remaining in team budget' };
    }

    // Squad size checks
    if (team.squad.length >= IPL_RULES.maxSquadSize) {
      return { valid: false, reason: `Maximum squad limit of ${IPL_RULES.maxSquadSize} reached` };
    }

    // Overseas count check
    if (room.currentPlayer.isOverseas) {
      const overseasCount = team.squad.filter((p) => p.isOverseas).length;
      if (overseasCount >= IPL_RULES.maxOverseasPlayers) {
        return { valid: false, reason: `Maximum overseas limit of ${IPL_RULES.maxOverseasPlayers} reached` };
      }
    }

    // Minimum Reserve Check: Must have enough purse left to complete min squad size with min base price ₹20L
    const minSlotsNeededAfterThis = Math.max(0, IPL_RULES.minSquadSize - (team.squad.length + 1));
    const minReserveNeeded = minSlotsNeededAfterThis * 20_00_000;
    if (team.purseRemaining - bidAmount < minReserveNeeded) {
      return {
        valid: false,
        reason: `Must retain at least ₹${minReserveNeeded / 100000} Lakhs to fill remaining squad slots (min ${IPL_RULES.minSquadSize} players)`,
      };
    }

    return { valid: true, minBidRequired: minBid };
  }

  /**
   * Process a valid bid on the auction state with absolute deadline and anti-snipe check
   */
  public static placeBid(room: AuctionRoomState, teamId: string, amount?: number): AuctionRoomState {
    const validation = this.validateBid(room, teamId, amount);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid bid');
    }

    const team = room.teams[teamId];
    const minBid = getNextMinBid(room.currentBid, room.currentPlayer!.basePrice);
    const bidAmount = amount !== undefined ? amount : minBid;

    const now = Date.now();
    const secondsRemaining = Math.max(0, Math.ceil((room.timer.bidDeadline - now) / 1000));

    // Anti-snipe rule: If bid placed within last 3 seconds, extend deadline by 5s!
    let newDuration = IPL_RULES.timerDurations.resetOnBidSeconds;
    if (secondsRemaining <= 3) {
      newDuration = secondsRemaining + IPL_RULES.timerDurations.antiSnipeSeconds;
    }

    const newDeadline = now + newDuration * 1000;

    const newBidLog: BidLog = {
      id: `bid_${now}_${Math.random().toString(36).substring(2, 6)}`,
      playerId: room.currentPlayer!.id,
      playerName: room.currentPlayer!.name,
      teamId,
      teamName: team.shortName,
      amount: bidAmount,
      timestamp: now,
      isRtm: false,
    };

    return {
      ...room,
      currentBid: bidAmount,
      highestBidderTeamId: teamId,
      bidHistory: [newBidLog, ...room.bidHistory],
      timer: {
        ...room.timer,
        secondsLeft: newDuration,
        duration: newDuration,
        bidDeadline: newDeadline,
        isRunning: true,
      },
      updatedAt: now,
    };
  }

  /**
   * Evaluate timer expiry and transition phase accordingly
   */
  public static handleTimerExpiry(room: AuctionRoomState): AuctionRoomState {
    if (room.phase === 'BIDDING') {
      if (room.highestBidderTeamId && room.currentPlayer) {
        // Check RTM eligibility
        const originalTeamId = room.currentPlayer.originalTeamId;
        const originalTeam = originalTeamId ? room.teams[originalTeamId] : null;

        const canRtm =
          originalTeamId &&
          originalTeam &&
          originalTeam.ownerSocketId &&
          originalTeamId !== room.highestBidderTeamId &&
          originalTeam.rtmRemaining > 0 &&
          originalTeam.purseRemaining >= room.currentBid &&
          originalTeam.squad.length < IPL_RULES.maxSquadSize &&
          (!room.currentPlayer.isOverseas ||
            originalTeam.squad.filter((p) => p.isOverseas).length < IPL_RULES.maxOverseasPlayers);

        if (canRtm) {
          return {
            ...room,
            phase: 'RTM_PENDING',
            rtmAskingBid: room.currentBid,
            timer: {
              secondsLeft: IPL_RULES.timerDurations.rtmDecisionSeconds,
              duration: IPL_RULES.timerDurations.rtmDecisionSeconds,
              bidDeadline: Date.now() + IPL_RULES.timerDurations.rtmDecisionSeconds * 1000,
              isRunning: true,
            },
            updatedAt: Date.now(),
          };
        }

        // Sell immediately if no RTM
        return this.finalizeSale(room, room.highestBidderTeamId, room.currentBid, false);
      } else {
        // Player Unsold
        return this.finalizeUnsold(room);
      }
    }

    if (room.phase === 'RTM_PENDING') {
      // RTM timed out -> default to decline and sell to highest bidder
      return this.finalizeSale(room, room.highestBidderTeamId!, room.rtmAskingBid!, false);
    }

    if (room.phase === 'SOLD_PAUSE' || room.phase === 'UNSOLD_PAUSE') {
      return this.advanceToNextPlayer(room);
    }

    return room;
  }

  /**
   * Finalize selling a player to a team (with Mini mode overseas pay cap check)
   */
  public static finalizeSale(
    room: AuctionRoomState,
    winningTeamId: string,
    amount: number,
    isRtm: boolean
  ): AuctionRoomState {
    if (!room.currentPlayer) return room;

    const player = room.currentPlayer;
    let bcciWelfareFund = 0;

    // Mini Mode Overseas Pay Cap (₹18 Cr limit)
    if (room.config.mode === 'MINI_2026' && player.isOverseas && amount > 18_00_00_000) {
      bcciWelfareFund = amount - 18_00_00_000;
    }

    const team = room.teams[winningTeamId];
    const updatedTeam: TeamState = {
      ...team,
      purseRemaining: team.purseRemaining - amount,
      squad: [...team.squad, player],
      rtmRemaining: isRtm ? team.rtmRemaining - 1 : team.rtmRemaining,
    };

    const soldRecord = {
      player,
      soldToTeamId: winningTeamId,
      amount,
      isRtm,
      bcciWelfareFund: bcciWelfareFund > 0 ? bcciWelfareFund : undefined,
    };

    return {
      ...room,
      phase: 'SOLD_PAUSE',
      teams: {
        ...room.teams,
        [winningTeamId]: updatedTeam,
      },
      soldPlayers: [soldRecord, ...room.soldPlayers],
      timer: {
        secondsLeft: IPL_RULES.timerDurations.soldCountdownSeconds,
        duration: IPL_RULES.timerDurations.soldCountdownSeconds,
        bidDeadline: Date.now() + IPL_RULES.timerDurations.soldCountdownSeconds * 1000,
        isRunning: true,
      },
      updatedAt: Date.now(),
    };
  }

  /**
   * Finalize player going unsold
   */
  public static finalizeUnsold(room: AuctionRoomState): AuctionRoomState {
    if (!room.currentPlayer) return room;

    const unsoldPool = room.unsoldPool || [];
    const updatedUnsoldPool =
      !room.isAcceleratedMode && !unsoldPool.includes(room.currentPlayer.id)
        ? [...unsoldPool, room.currentPlayer.id]
        : unsoldPool;

    return {
      ...room,
      phase: 'UNSOLD_PAUSE',
      unsoldPlayers: [room.currentPlayer, ...room.unsoldPlayers],
      unsoldPool: updatedUnsoldPool,
      timer: {
        secondsLeft: IPL_RULES.timerDurations.unsoldCountdownSeconds,
        duration: IPL_RULES.timerDurations.unsoldCountdownSeconds,
        bidDeadline: Date.now() + IPL_RULES.timerDurations.unsoldCountdownSeconds * 1000,
        isRunning: true,
      },
      updatedAt: Date.now(),
    };
  }

  /**
   * Exercise Right to Match (RTM) decision
   */
  public static exerciseRtm(
    room: AuctionRoomState,
    teamId: string,
    decision: 'ACCEPT' | 'DECLINE'
  ): AuctionRoomState {
    if (room.phase !== 'RTM_PENDING' || !room.currentPlayer) {
      throw new Error('Not in RTM decision phase');
    }

    if (teamId !== room.currentPlayer.originalTeamId) {
      throw new Error('Only the original team can exercise RTM');
    }

    if (decision === 'ACCEPT') {
      return this.finalizeSale(room, teamId, room.rtmAskingBid!, true);
    } else {
      return this.finalizeSale(room, room.highestBidderTeamId!, room.rtmAskingBid!, false);
    }
  }

  /**
   * Advance to the next player in the queue
   */
  public static advanceToNextPlayer(room: AuctionRoomState): AuctionRoomState {
    const nextIndex = room.currentPlayerIndex + 1;

    if (nextIndex < room.playerPool.length) {
      const nextPlayer = room.playerPool[nextIndex];
      return {
        ...room,
        currentPlayerIndex: nextIndex,
        currentSetIndex: nextPlayer.setNumber,
        currentPlayer: nextPlayer,
        currentBid: 0,
        highestBidderTeamId: null,
        rtmClaimedByTeamId: null,
        rtmAskingBid: null,
        phase: room.isAcceleratedMode ? 'ACCEL_BIDDING' : 'BIDDING',
        timer: {
          secondsLeft: IPL_RULES.timerDurations.biddingSeconds,
          duration: IPL_RULES.timerDurations.biddingSeconds,
          bidDeadline: Date.now() + IPL_RULES.timerDurations.biddingSeconds * 1000,
          isRunning: true,
        },
        updatedAt: Date.now(),
      };
    }

    // Player pool exhausted! Check if there are unsold players and not yet accelerated
    const availableUnsoldCount = (room.unsoldPool || []).length > 0 ? room.unsoldPool.length : room.unsoldPlayers.length;
    if (availableUnsoldCount > 0 && !room.isAcceleratedMode) {
      const deadline = Date.now() + 90_000; // Default 90s nomination window
      return {
        ...room,
        phase: 'ACCEL_NOMINATION',
        currentPlayer: null,
        currentBid: 0,
        highestBidderTeamId: null,
        accelNominationDeadline: deadline,
        timer: {
          secondsLeft: 90,
          duration: 90,
          bidDeadline: deadline,
          isRunning: true,
        },
        updatedAt: Date.now(),
      };
    }

    // All rounds finished!
    return {
      ...room,
      phase: 'COMPLETED',
      currentPlayer: null,
      currentBid: 0,
      highestBidderTeamId: null,
      timer: {
        secondsLeft: 0,
        duration: 0,
        bidDeadline: 0,
        isRunning: false,
      },
      updatedAt: Date.now(),
    };
  }

  /**
   * Start accelerated round driven by team nominations (union de-duplicated, grouped by role, shuffled per role)
   */
  public static startAcceleratedRound(
    room: AuctionRoomState,
    nominationsInput?: Record<string, string[]> | string[]
  ): AuctionRoomState {
    const soldPlayerIds = new Set(room.soldPlayers.map((s) => s.player.id));
    let nominatedIds: string[] = [];

    if (Array.isArray(nominationsInput)) {
      nominatedIds = nominationsInput;
    } else if (nominationsInput && typeof nominationsInput === 'object') {
      const set = new Set<string>();
      Object.values(nominationsInput).forEach((list) => {
        if (Array.isArray(list)) list.forEach((id) => set.add(id));
      });
      nominatedIds = Array.from(set);
    } else if (room.nominations && Object.keys(room.nominations).length > 0) {
      const set = new Set<string>();
      Object.values(room.nominations).forEach((list) => {
        if (Array.isArray(list)) list.forEach((id) => set.add(id));
      });
      nominatedIds = Array.from(set);
    } else if ((room.unsoldPool || []).length > 0) {
      nominatedIds = [...room.unsoldPool];
    } else {
      nominatedIds = room.unsoldPlayers.map((p) => p.id);
    }

    // De-duplicate union and ensure no sold player enters accelerated pool
    const uniqueNominatedIds = Array.from(new Set(nominatedIds)).filter((id) => !soldPlayerIds.has(id));

    if (uniqueNominatedIds.length === 0) {
      return {
        ...room,
        phase: 'COMPLETED',
        accelList: [],
        currentPlayer: null,
        currentBid: 0,
        highestBidderTeamId: null,
        timer: { secondsLeft: 0, duration: 0, bidDeadline: 0, isRunning: false },
        updatedAt: Date.now(),
      };
    }

    // Resolve full player objects
    const allKnownPlayers = new Map<string, Player>();
    INITIAL_PLAYER_DATASET.forEach((p) => allKnownPlayers.set(p.id, p));
    room.playerPool.forEach((p) => allKnownPlayers.set(p.id, p));
    room.unsoldPlayers.forEach((p) => allKnownPlayers.set(p.id, p));

    const nominatedPlayerObjects = uniqueNominatedIds
      .map((id) => allKnownPlayers.get(id))
      .filter((p): p is Player => p !== undefined);

    // Group by role: WICKETKEEPER, BATTER, ALL_ROUNDER, BOWLER
    const roleOrder = ['WICKETKEEPER', 'BATTER', 'ALL_ROUNDER', 'BOWLER'];
    const groupedByRole: Record<string, Player[]> = {
      WICKETKEEPER: [],
      BATTER: [],
      ALL_ROUNDER: [],
      BOWLER: [],
    };

    for (const player of nominatedPlayerObjects) {
      const r = player.role || 'BATTER';
      if (!groupedByRole[r]) {
        groupedByRole[r] = [];
      }
      groupedByRole[r].push(player);
    }

    const accelPool: Player[] = [];
    for (const role of roleOrder) {
      const group = groupedByRole[role] || [];
      // Shuffle within each role group
      for (let i = group.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [group[i], group[j]] = [group[j], group[i]];
      }
      accelPool.push(...group);
    }

    const accelList = accelPool.map((p) => p.id);
    const firstPlayer = accelPool.length > 0 ? accelPool[0] : null;

    return {
      ...room,
      isAcceleratedMode: true,
      accelList,
      playerPool: accelPool,
      currentPlayerIndex: 0,
      currentSetIndex: firstPlayer ? firstPlayer.setNumber : room.currentSetIndex,
      currentPlayer: firstPlayer,
      currentBid: 0,
      highestBidderTeamId: null,
      phase: firstPlayer ? 'ACCEL_BIDDING' : 'COMPLETED',
      timer: {
        secondsLeft: IPL_RULES.timerDurations.biddingSeconds,
        duration: IPL_RULES.timerDurations.biddingSeconds,
        bidDeadline: Date.now() + IPL_RULES.timerDurations.biddingSeconds * 1000,
        isRunning: !!firstPlayer,
      },
      updatedAt: Date.now(),
    };
  }

  /**
   * Group players by setNumber, shuffle players within each set, and return pooled array preserving set sequence.
   */
  public static shufflePoolBySet<T extends { setNumber: number }>(dataset: readonly T[]): T[] {
    const setMap = new Map<number, T[]>();
    for (const player of dataset) {
      if (!setMap.has(player.setNumber)) {
        setMap.set(player.setNumber, []);
      }
      setMap.get(player.setNumber)!.push(player);
    }

    const sortedSetNumbers = Array.from(setMap.keys()).sort((a, b) => a - b);
    const result: T[] = [];

    for (const setNum of sortedSetNumbers) {
      const setPlayers = [...setMap.get(setNum)!];
      for (let i = setPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [setPlayers[i], setPlayers[j]] = [setPlayers[j], setPlayers[i]];
      }
      result.push(...setPlayers);
    }
    return result;
  }
}
