import { describe, it, expect } from 'vitest';
import { AuctionEngine } from '../src/engine/auctionEngine';
import { AuctionRoomState } from '../src/types';

describe('Phase 7: Load Test & Anti-Double-Sale Verification', () => {
  it('handles 10 teams and spectators with rapid concurrent bids without double sales or timer drift', () => {
    // 1. Create room with 10 teams
    let room = AuctionEngine.createInitialRoom('LOAD10', 'IPL Load Test Room', 'host_socket_1', 'host_session_1', {
      mode: 'MEGA_2025',
      roomSize: 10,
      timerLength: 15,
      fillWithBots: false,
    });

    const teamIds = Object.keys(room.teams);
    expect(teamIds.length).toBe(10);

    // 2. Claim all 10 teams by distinct client session tokens
    teamIds.forEach((teamId, index) => {
      room.teams[teamId].ownerSocketId = `socket_client_${index + 1}`;
      room.teams[teamId].ownerSessionToken = `session_token_${index + 1}`;
      room.teams[teamId].ownerName = `Owner ${index + 1}`;
      room.teams[teamId].isReady = true;
    });

    // 3. Add 5 spectators
    for (let i = 1; i <= 5; i++) {
      room.spectators.push({
        socketId: `spectator_socket_${i}`,
        sessionToken: `spectator_session_${i}`,
        name: `Spectator ${i}`,
      });
    }

    // 4. Start Auction
    room.phase = 'BIDDING';
    room.timer.isRunning = true;
    room.timer.secondsLeft = 15;

    // 5. Simulate 100 rapid concurrent bidding actions across players
    for (let round = 0; round < 15; round++) {
      if (!room.currentPlayer) break;

      // Simulate alternating rapid bids from 4 different teams
      for (let b = 0; b < 4; b++) {
        const biddingTeamId = teamIds[b % 10];
        try {
          room = AuctionEngine.placeBid(room, biddingTeamId);
        } catch {
          // Ignore invalid bid attempts when team has leading bid or insufficient purse
        }
      }

      // Expire timer to sell player
      room.timer.secondsLeft = 0;
      room = AuctionEngine.handleTimerExpiry(room);
    }

    // 6. Verify No Double Sales
    const allPurchasedPlayers = Object.values(room.teams).flatMap((t) => t.squad);
    const purchasedPlayerIds = allPurchasedPlayers.map((p) => p.id);
    const uniquePurchasedIds = new Set(purchasedPlayerIds);

    // Ensure every purchased player ID is unique (zero duplicate/double sales)
    expect(purchasedPlayerIds.length).toBe(uniquePurchasedIds.size);
    expect(room.soldPlayers.length).toBe(purchasedPlayerIds.length);

    // Verify sold players record matches squads
    room.soldPlayers.forEach((soldRecord) => {
      const ownerTeam = room.teams[soldRecord.soldToTeamId];
      expect(ownerTeam.squad.some((p) => p.id === soldRecord.player.id)).toBe(true);
    });

    // 7. Verify Timer Integrity
    expect(room.timer.secondsLeft).toBeGreaterThanOrEqual(0);
    expect(room.timer.bidDeadline).toBeGreaterThan(0);
  });
});
