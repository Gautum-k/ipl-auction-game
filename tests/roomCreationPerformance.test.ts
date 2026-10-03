import { describe, it, expect } from 'vitest';
import { AuctionEngine } from '../src/engine/auctionEngine';
import { generateRoomCode } from '../src/lib/roomCode';

describe('Phase 9A: Room Creation Performance & Uniqueness Regression Test', () => {
  it('creates 20 rooms in rapid succession under 500ms each with zero duplicate room codes', () => {
    const createdCodes = new Set<string>();
    const timingResults: number[] = [];

    for (let i = 0; i < 20; i++) {
      const tStart = performance.now();

      // 1. Generate unique code
      let code = generateRoomCode();
      let attempts = 0;
      while (createdCodes.has(code) && attempts < 100) {
        code = generateRoomCode();
        attempts++;
      }

      // 2. Create room state
      const room = AuctionEngine.createInitialRoom(
        code,
        `Performance Test Room ${i + 1}`,
        `host_socket_${i + 1}`,
        `host_session_${i + 1}`,
        { mode: 'MEGA_2025', roomSize: 10, timerLength: 15, fillWithBots: false }
      );

      const tDuration = performance.now() - tStart;
      timingResults.push(tDuration);

      // Verify room structure integrity
      expect(room.roomCode).toBe(code);
      expect(Object.keys(room.teams).length).toBe(10);
      expect(room.playerPool.length).toBeGreaterThan(0);

      createdCodes.add(code);

      // Assert room creation completes in under 500ms (target threshold)
      expect(tDuration).toBeLessThan(500);
    }

    // Verify exactly 20 unique codes generated without collision
    expect(createdCodes.size).toBe(20);

    const avgTime = timingResults.reduce((sum, t) => sum + t, 0) / timingResults.length;
    const maxTime = Math.max(...timingResults);

    console.log(`📊 20-Room Creation Performance Summary:`);
    console.log(`   - Average Time per Room: ${avgTime.toFixed(2)}ms`);
    console.log(`   - Max Time per Room: ${maxTime.toFixed(2)}ms`);
    console.log(`   - Total 20 Rooms Creation Time: ${timingResults.reduce((a, b) => a + b, 0).toFixed(2)}ms`);
  });
});
