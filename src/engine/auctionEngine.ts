import { IPL_RULES, getNextMinBid } from '../config/rules';
import { INITIAL_PLAYER_DATASET } from '../data/players';
import { AuctionRoomConfig, AuctionRoomState, BidLog, TeamState } from '../types';

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

    const pool = [...INITIAL_PLAYER_DATASET].sort((a, b) => a.setNumber - b.setNumber);
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

    return {
      ...room,
      phase: 'UNSOLD_PAUSE',
      unsoldPlayers: [room.currentPlayer, ...room.unsoldPlayers],
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
        phase: 'BIDDING',
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
    if (room.unsoldPlayers.length > 0 && !room.isAcceleratedMode) {
      return {
        ...room,
        phase: 'NOMINATING', // Host can trigger accelerated round
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
   * Start accelerated round with chosen unsold players
   */
  public static startAcceleratedRound(room: AuctionRoomState, selectedUnsoldIds?: string[]): AuctionRoomState {
    const poolToUse = selectedUnsoldIds
      ? room.unsoldPlayers.filter((p) => selectedUnsoldIds.includes(p.id))
      : [...room.unsoldPlayers];

    if (poolToUse.length === 0) {
      return {
        ...room,
        phase: 'COMPLETED',
        timer: { secondsLeft: 0, duration: 0, bidDeadline: 0, isRunning: false },
      };
    }

    const firstPlayer = poolToUse[0];

    return {
      ...room,
      isAcceleratedMode: true,
      playerPool: poolToUse,
      currentPlayerIndex: 0,
      currentPlayer: firstPlayer,
      currentBid: 0,
      highestBidderTeamId: null,
      unsoldPlayers: [],
      phase: 'BIDDING',
      timer: {
        secondsLeft: IPL_RULES.timerDurations.biddingSeconds,
        duration: IPL_RULES.timerDurations.biddingSeconds,
        bidDeadline: Date.now() + IPL_RULES.timerDurations.biddingSeconds * 1000,
        isRunning: true,
      },
      updatedAt: Date.now(),
    };
  }
}
