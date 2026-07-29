function parseAllowlist(value) {
  if (!value) return new Set();
  return new Set(
    value
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function getAdminAllowlist() {
  const emails = parseAllowlist(
    process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS
  );
  const uids = parseAllowlist(process.env.ADMIN_UIDS || process.env.VITE_ADMIN_UIDS);
  return { emails, uids };
}

export function isAdminIdentity({ uid, email }) {
  const { emails, uids } = getAdminAllowlist();
  if (!emails.size && !uids.size) return false;
  if (uid && uids.has(String(uid).toLowerCase())) return true;
  if (email && emails.has(String(email).toLowerCase())) return true;
  return false;
}
