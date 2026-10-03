import { INITIAL_PLAYER_DATASET } from '../data/players';
import { AuctionRoomState, Player } from '../types';
import { AuctionEngine } from './auctionEngine';

export class BotEngine {
  /**
   * Evaluates if any AI bot team should place a bid on the current player
   */
  public static evaluateBotBids(room: AuctionRoomState): { shouldBid: boolean; teamId?: string; amount?: number } {
    if (room.phase !== 'BIDDING' || !room.currentPlayer) {
      return { shouldBid: false };
    }

    const player = room.currentPlayer;

    // Find all bot teams (or unclaimed teams when fillWithBots is enabled)
    const eligibleBotTeams = Object.values(room.teams).filter((team) => {
      // Must be a bot or unclaimed team when fillWithBots is true
      const isTargetBot = team.isBot || (room.config.fillWithBots && team.ownerSocketId === null);
      if (!isTargetBot) return false;

      // Don't bid if already highest bidder
      if (room.highestBidderTeamId === team.teamId) return false;

      // Check validation
      const validation = AuctionEngine.validateBid(room, team.teamId);
      if (!validation.valid) return false;

      // Check valuation threshold (e.g. don't overpay beyond 3x base price for bots)
      const maxValuation = Math.max(player.basePrice * 3, 5_00_00_000);
      const nextMinBid = validation.minBidRequired || player.basePrice;
      if (nextMinBid > maxValuation) return false;

      return true;
    });

    if (eligibleBotTeams.length === 0) {
      return { shouldBid: false };
    }

    // Pick a random eligible bot team to place the bid
    const chosenBot = eligibleBotTeams[Math.floor(Math.random() * eligibleBotTeams.length)];
    const minBid = AuctionEngine.validateBid(room, chosenBot.teamId).minBidRequired || player.basePrice;

    return {
      shouldBid: true,
      teamId: chosenBot.teamId,
      amount: minBid,
    };
  }

  /**
   * Auto-nominates unsold players for bot teams based on squad needs
   */
  public static evaluateBotNominations(room: AuctionRoomState): AuctionRoomState {
    if (room.phase !== 'ACCEL_NOMINATION') return room;

    const knownPlayersMap = new Map<string, Player>();
    INITIAL_PLAYER_DATASET.forEach((p) => knownPlayersMap.set(p.id, p));
    room.playerPool.forEach((p) => knownPlayersMap.set(p.id, p));
    room.unsoldPlayers.forEach((p) => knownPlayersMap.set(p.id, p));

    const unsoldIds = room.unsoldPool || [];
    const nominations = { ...(room.nominations || {}) };
    const doneTeams = new Set(room.nominationDoneTeams || []);

    Object.values(room.teams).forEach((team) => {
      const isBotTeam = team.isBot || (room.config.fillWithBots && !team.ownerSocketId);
      if (!isBotTeam || doneTeams.has(team.teamId)) return;

      const currentNominated = nominations[team.teamId] || [];
      const currentOverseasNominated = currentNominated
        .map((id) => knownPlayersMap.get(id))
        .filter((p) => p && p.isOverseas).length;

      const currentOverseasCount = team.squad.filter((p) => p.isOverseas).length;
      const targetNominationCount = Math.max(3, 25 - team.squad.length);

      const botPicks: string[] = [...currentNominated];

      for (const pId of unsoldIds) {
        if (botPicks.length >= targetNominationCount) break;
        if (botPicks.includes(pId)) continue;

        const player = knownPlayersMap.get(pId);
        if (!player) continue;

        // Validation rules: purse, squad < 25, overseas < 8
        if (player.basePrice > team.purseRemaining) continue;
        if (team.squad.length + botPicks.length >= 25) break;
        if (player.isOverseas && currentOverseasCount + currentOverseasNominated >= 8) continue;

        botPicks.push(pId);
      }

      nominations[team.teamId] = botPicks;
      doneTeams.add(team.teamId);
    });

    return {
      ...room,
      nominations,
      nominationDoneTeams: Array.from(doneTeams),
    };
  }
}
