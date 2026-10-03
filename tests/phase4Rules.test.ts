import { describe, expect, it } from 'vitest';
import { AuctionEngine } from '../src/engine/auctionEngine';


describe('Phase 4: Mini Mode Pay Cap & Anti-Snipe Rules', () => {
  it('should split surplus above 18 Cr into BCCI Welfare Fund in Mini Mode', () => {
    let room = AuctionEngine.createInitialRoom('MINI1', 'Mini Room', 'host_s1', 'host_t1', {
      mode: 'MINI_2026',
    });

    // Make current player overseas
    room.currentPlayer = {
      id: 'ovs_test',
      name: 'Mitchell Starc',
      role: 'BOWLER',
      category: 'OVERSEAS',
      country: 'Australia',
      isOverseas: true,
      basePrice: 2_00_00_000,
      setNumber: 1,
      setName: 'Set 1',
      stats: { matches: 20 },
    };

    room.teams['CSK'].ownerSocketId = 'csk_s';

    // Sell for 20 Cr (20,00,00,000)
    room = AuctionEngine.finalizeSale(room, 'CSK', 20_00_00_000, false);

    expect(room.soldPlayers[0].amount).toBe(20_00_00_000);
    expect(room.soldPlayers[0].bcciWelfareFund).toBe(2_00_00_000); // 20 Cr - 18 Cr = 2 Cr surplus
  });

  it('should extend bid deadline by antiSnipeSeconds when bid arrives near deadline', () => {
    let room = AuctionEngine.createInitialRoom('SNIPE1', 'Snipe Room', 'host_s1');
    room.phase = 'BIDDING';
    room.teams['CSK'].ownerSocketId = 'csk_s';

    // Set deadline to 2 seconds from now (snipe zone!)
    room.timer.bidDeadline = Date.now() + 2000;

    room = AuctionEngine.placeBid(room, 'CSK');

    expect(room.timer.duration).toBeGreaterThanOrEqual(5);
  });
});
