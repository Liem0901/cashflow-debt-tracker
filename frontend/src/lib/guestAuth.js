const GUEST_SESSION_KEY = 'cashflow_guest_session';

export function readGuestSession() {
  try {
    const raw = window.localStorage.getItem(GUEST_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.uid || !session?.displayName) return null;
    return { ...session, isGuest: true };
  } catch {
    return null;
  }
}

export function writeGuestSession(session) {
  window.localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
}

export function clearGuestSession() {
  window.localStorage.removeItem(GUEST_SESSION_KEY);
}

export function createGuestSession(displayName) {
  const name = displayName.trim();
  const existing = readGuestSession();
  const uid =
    existing?.displayName === name
      ? existing.uid
      : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const session = {
    uid,
    displayName: name,
    isGuest: true,
  };

  writeGuestSession(session);
  return session;
}
