import '../../lib/loadLocalEnv.js';
import { verifyAuthTokenFull } from './auth.js';

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

export async function requireAdmin(req, res) {
  const identity = await verifyAuthTokenFull(req.headers.authorization);
  if (!identity) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  if (!isAdminIdentity(identity)) {
    const { emails, uids } = getAdminAllowlist();
    const hint =
      !emails.size && !uids.size
        ? 'Set ADMIN_EMAILS or ADMIN_UIDS in server environment (e.g. .env.local, then restart npm run dev:full).'
        : `Signed in as uid=${identity.uid}${identity.email ? ` email=${identity.email}` : ' (no email on token)'}. Add this to ADMIN_EMAILS or ADMIN_UIDS.`;

    res.status(403).json({ error: 'Forbidden — admin access required', hint });
    return null;
  }

  return identity;
}

export function setAdminCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
