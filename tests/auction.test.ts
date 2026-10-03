import { describe, expect, it } from 'vitest';
import { AuctionEngine } from '../src/engine/auctionEngine';
import { IPL_RULES } from '../src/config/rules';

describe('Root Auction Integration Test', () => {
  it('should pass full auction room flow test', () => {
    const room = AuctionEngine.createInitialRoom('ROOT1', 'Root Test', 'socket_1');
    expect(room.roomCode).toBe('ROOT1');
    expect(room.teams['CSK'].purseRemaining).toBe(IPL_RULES.maxPursePerTeam);
  });
});
