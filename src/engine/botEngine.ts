import { AuctionRoomState } from '../types';
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
}
