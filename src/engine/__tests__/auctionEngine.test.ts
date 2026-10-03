import { describe, expect, it } from 'vitest';
import { IPL_RULES } from '../../config/rules';

import { AuctionEngine } from '../auctionEngine';

describe('AuctionEngine Core Unit Tests', () => {
  it('should initialize room state correctly', () => {
    const room = AuctionEngine.createInitialRoom('TEST1', 'Test Room', 'socket_host_123');

    expect(room.roomCode).toBe('TEST1');
    expect(room.phase).toBe('LOBBY');
    expect(Object.keys(room.teams).length).toBe(IPL_RULES.teamOptions.length);
    expect(room.teams['CSK'].purseRemaining).toBe(120_00_00_000);
    expect(room.teams['CSK'].squad.length).toBe(0);
    expect(room.teams['CSK'].rtmRemaining).toBe(3);
    expect(room.currentPlayer).not.toBeNull();
  });

  it('should prevent bidding when room is in LOBBY phase', () => {
    const room = AuctionEngine.createInitialRoom('TEST1', 'Test Room', 'socket_host_123');
    // Claim team CSK
    room.teams['CSK'].ownerSocketId = 'socket_csk_user';

    const validation = AuctionEngine.validateBid(room, 'CSK');
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('not in bidding phase');
  });

  it('should validate and process valid bids correctly', () => {
    let room = AuctionEngine.createInitialRoom('TEST1', 'Test Room', 'socket_host_123');
    room.phase = 'BIDDING';
    room.teams['CSK'].ownerSocketId = 'socket_csk';
    room.teams['MI'].ownerSocketId = 'socket_mi';

    // Base price is 2 Cr (20,00,00,000 / 2,00,00,000)
    const basePrice = room.currentPlayer!.basePrice;

    // 1st bid by CSK
    let validation = AuctionEngine.validateBid(room, 'CSK');
    expect(validation.valid).toBe(true);

    room = AuctionEngine.placeBid(room, 'CSK');
    expect(room.currentBid).toBe(basePrice);
    expect(room.highestBidderTeamId).toBe('CSK');
    expect(room.bidHistory.length).toBe(1);

    // CSK tries to bid again immediately (self-bidding)
    validation = AuctionEngine.validateBid(room, 'CSK');
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('already the highest bidder');

    // MI bids next
    validation = AuctionEngine.validateBid(room, 'MI');
    expect(validation.valid).toBe(true);

    room = AuctionEngine.placeBid(room, 'MI');
    expect(room.currentBid).toBe(basePrice + 20_00_000); // 2.20 Cr (+20L step)
    expect(room.highestBidderTeamId).toBe('MI');
    expect(room.bidHistory.length).toBe(2);
  });

  it('should enforce purse budget limits', () => {
    const room = AuctionEngine.createInitialRoom('TEST1', 'Test Room', 'socket_host_123');
    room.phase = 'BIDDING';
    room.teams['CSK'].ownerSocketId = 'socket_csk';
    room.teams['CSK'].purseRemaining = 1_00_00_000; // Only 1 Cr left

    const validation = AuctionEngine.validateBid(room, 'CSK', 2_00_00_000);
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('Insufficient purse');
  });

  it('should enforce overseas player limits', () => {
    const room = AuctionEngine.createInitialRoom('TEST1', 'Test Room', 'socket_host_123');
    room.phase = 'BIDDING';
    room.teams['CSK'].ownerSocketId = 'socket_csk';

    // Fill CSK squad with 8 overseas players
    room.teams['CSK'].squad = Array(8).fill({
      id: 'dummy',
      name: 'Overseas Player',
      role: 'BATTER',
      category: 'OVERSEAS',
      country: 'Australia',
      isOverseas: true,
      basePrice: 20_00_000,
      setNumber: 1,
      setName: 'Set 1',
      stats: { matches: 10 },
    });

    // Make current player overseas
    room.currentPlayer = {
      id: 'p_overseas',
      name: 'Pat Cummins',
      role: 'BOWLER',
      category: 'OVERSEAS',
      country: 'Australia',
      isOverseas: true,
      basePrice: 2_00_00_000,
      setNumber: 1,
      setName: 'Set 1',
      stats: { matches: 10 },
    };

    const validation = AuctionEngine.validateBid(room, 'CSK');
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('Maximum overseas limit');
  });

  it('should trigger RTM pending phase when highest bidder is not original team and original team has RTM', () => {
    let room = AuctionEngine.createInitialRoom('TEST1', 'Test Room', 'socket_host_123');
    room.phase = 'BIDDING';

    // Set current player with original team 'RCB'
    room.currentPlayer = {
      id: 'vk1',
      name: 'Virat Kohli',
      role: 'BATTER',
      category: 'CAPPED_INDIAN',
      country: 'India',
      isOverseas: false,
      basePrice: 2_00_00_000,
      originalTeamId: 'RCB',
      setNumber: 1,
      setName: 'Marquee 1',
      stats: { matches: 200 },
    };

    room.teams['MI'].ownerSocketId = 'socket_mi';
    room.teams['RCB'].ownerSocketId = 'socket_rcb';

    // MI bids
    room = AuctionEngine.placeBid(room, 'MI');
    expect(room.highestBidderTeamId).toBe('MI');

    // Timer expires
    room = AuctionEngine.handleTimerExpiry(room);
    expect(room.phase).toBe('RTM_PENDING');
    expect(room.rtmAskingBid).toBe(2_00_00_000);

    // RCB accepts RTM
    room = AuctionEngine.exerciseRtm(room, 'RCB', 'ACCEPT');
    expect(room.phase).toBe('SOLD_PAUSE');
    expect(room.teams['RCB'].squad.length).toBe(1);
    expect(room.teams['RCB'].rtmRemaining).toBe(2);
    expect(room.soldPlayers[0].soldToTeamId).toBe('RCB');
    expect(room.soldPlayers[0].isRtm).toBe(true);
  });

  it('should finalize unsold player when no bids are placed', () => {
    let room = AuctionEngine.createInitialRoom('TEST1', 'Test Room', 'socket_host_123');
    room.phase = 'BIDDING';
    room.highestBidderTeamId = null;

    room = AuctionEngine.handleTimerExpiry(room);
    expect(room.phase).toBe('UNSOLD_PAUSE');
    expect(room.unsoldPlayers.length).toBe(1);
  });

  it('should maintain strict non-decreasing set order sequence in player pool', () => {
    const room = AuctionEngine.createInitialRoom('TEST2', 'Test Set Sequence', 'socket_host_999');
    for (let i = 0; i < room.playerPool.length - 1; i++) {
      expect(room.playerPool[i].setNumber).toBeLessThanOrEqual(room.playerPool[i + 1].setNumber);
    }
  });

  it('should guarantee zero duplicate sold player IDs across full auction flow including accelerated round', () => {
    let room = AuctionEngine.createInitialRoom('TEST3', 'Test Uniqueness', 'socket_host_888');
    room.phase = 'BIDDING';
    room.teams['CSK'].ownerSocketId = 'socket_csk';
    room.teams['MI'].ownerSocketId = 'socket_mi';

    // Sell first 5 players to CSK
    for (let i = 0; i < 5; i++) {
      room.highestBidderTeamId = 'CSK';
      room.currentBid = 2_00_00_000;
      room = AuctionEngine.handleTimerExpiry(room); // SOLD_PAUSE
      room = AuctionEngine.advanceToNextPlayer(room); // BIDDING
    }

    // Leave next 5 players unsold
    for (let i = 0; i < 5; i++) {
      room.highestBidderTeamId = null;
      room = AuctionEngine.handleTimerExpiry(room); // UNSOLD_PAUSE
      room = AuctionEngine.advanceToNextPlayer(room); // BIDDING
    }

    // Trigger accelerated round with unsold players
    const unsoldIds = room.unsoldPlayers.map((p) => p.id);
    room = AuctionEngine.startAcceleratedRound(room, unsoldIds);
    expect(room.isAcceleratedMode).toBe(true);

    // Sell accelerated players to MI
    while (room.currentPlayer && room.phase === 'BIDDING') {
      room.highestBidderTeamId = 'MI';
      room.currentBid = 50_00_000;
      room = AuctionEngine.handleTimerExpiry(room); // SOLD_PAUSE
      room = AuctionEngine.advanceToNextPlayer(room);
    }

    // Assert zero duplicate player IDs across all sold records
    const soldIds = room.soldPlayers.map((s) => s.player.id);
    const uniqueSoldIds = new Set(soldIds);
    expect(soldIds.length).toBe(uniqueSoldIds.size);
  });
});
