import { describe, expect, it } from 'vitest';
import { generateRoomCode, sanitizeDisplayName } from '../src/lib/roomCode';

describe('Phase 3: Room Code & Identity Unit Tests', () => {
  it('should generate unambiguous 6-character room codes without 0, O, 1, I', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode();
      expect(code.length).toBe(6);
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  it('should validate display names and reject profanity and invalid lengths', () => {
    expect(sanitizeDisplayName('Rohit').valid).toBe(true);
    expect(sanitizeDisplayName('A').valid).toBe(false); // Too short
    expect(sanitizeDisplayName('A'.repeat(25)).valid).toBe(false); // Too long
    expect(sanitizeDisplayName('admin_user').valid).toBe(false); // Reserved/bad word
  });
});
