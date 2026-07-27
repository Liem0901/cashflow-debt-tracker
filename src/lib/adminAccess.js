function parseAllowlist(value) {
  if (!value) return new Set();
  return new Set(
    value
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

const adminEmails = parseAllowlist(import.meta.env.VITE_ADMIN_EMAILS);
const adminUids = parseAllowlist(import.meta.env.VITE_ADMIN_UIDS);

export function isAdminUser(user) {
  if (!user) return false;
  if (user.isGuest) return false;

  if (user.uid && adminUids.has(String(user.uid).toLowerCase())) return true;
  if (user.email && adminEmails.has(String(user.email).toLowerCase())) return true;

  return false;
}

export function hasAdminAllowlist() {
  return adminEmails.size > 0 || adminUids.size > 0;
}
