/**
 * Browser guest session token helper.
 * Generates & persists cryptographically random tokens bound to specific room codes.
 * Allows reclaiming exact team seat after refresh / disconnect.
 */
export function getOrCreateSessionToken(roomCode?: string): string {
  if (typeof window === 'undefined') return 'server_session';

  const key = roomCode ? `ipl_session_${roomCode.toUpperCase()}` : 'ipl_guest_session_token';
  let token = localStorage.getItem(key);

  if (!token) {
    let randomPart: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      randomPart = crypto.randomUUID().replace(/-/g, '');
    } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      randomPart = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
    } else {
      randomPart = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`;
    }

    token = roomCode ? `sess_${roomCode.toUpperCase()}_${randomPart}` : `sess_global_${randomPart}`;
    localStorage.setItem(key, token);
  }

  return token;
}

export function clearRoomSessionToken(roomCode: string): void {
  if (typeof window !== 'undefined' && roomCode) {
    localStorage.removeItem(`ipl_session_${roomCode.toUpperCase()}`);
  }
}
