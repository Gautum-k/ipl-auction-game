// Unambiguous character set (Excludes 0, O, 1, I to avoid visual confusion)
const UNAMBIGUOUS_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a 6-character unambiguous room code (e.g. "K9P4X7")
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length);
    code += UNAMBIGUOUS_CHARS[randomIndex];
  }
  return code;
}

/**
 * Basic profanity filter & display name sanitizer
 */

const BAD_WORDS = ['admin', 'bcci', 'ipl_official', 'fuck', 'shit', 'asshole', 'bitch', 'cunt'];

export function sanitizeDisplayName(name: string): { valid: boolean; name: string; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, name: trimmed, error: 'Display name must be at least 2 characters long' };
  }
  if (trimmed.length > 20) {
    return { valid: false, name: trimmed.substring(0, 20), error: 'Display name cannot exceed 20 characters' };
  }

  const lower = trimmed.toLowerCase();
  for (const bad of BAD_WORDS) {
    if (lower.includes(bad)) {
      return { valid: false, name: trimmed, error: 'Please choose an appropriate display name' };
    }
  }

  return { valid: true, name: trimmed };
}
