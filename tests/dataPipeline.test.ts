import { describe, expect, it } from 'vitest';
import { validatePlayerPool } from '../scripts/validate-players';
import path from 'path';

describe('Player Data Pipeline & Validation Unit Tests', () => {
  it('should validate mega auction seed dataset without errors', () => {
    const seedPath = path.join(__dirname, '../data/auction-seed-mega-2025.json');
    const result = validatePlayerPool(seedPath);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.stats.total).toBeGreaterThanOrEqual(180);
  });

  it('should validate mini auction seed dataset without errors', () => {
    const seedPath = path.join(__dirname, '../data/auction-seed-mini-2026.json');
    const result = validatePlayerPool(seedPath);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.stats.total).toBeGreaterThanOrEqual(180);
  });

  it('should fail validation when pool size is below minimum required 180 players', () => {
    // Create temporary small pool check
    const smallPoolResult = validatePlayerPool(path.join(__dirname, '../data/needs-review.json'));
    expect(smallPoolResult.valid).toBe(false);
    expect(smallPoolResult.errors.some(e => e.includes('too small'))).toBe(true);
  });
});
