/**
 * Browser guest session token helper.
 * On first visit, generates & persists a unique session token in localStorage.
 * No account required. Allows reclaiming exact team seat after refresh / disconnect.
 */
export function getOrCreateSessionToken(): string {
  if (typeof window === 'undefined') return 'server_session';

  let token = localStorage.getItem('ipl_guest_session_token');
  if (!token) {
    token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('ipl_guest_session_token', token);
  }
  return token;
}
