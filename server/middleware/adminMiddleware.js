import { verifyAuthTokenFull } from '../config/firebase.js';
import { getDb } from '../config/mongodb.js';
import { ensureIndexes } from '../config/dbIndexes.js';
import { AdminRepository } from '../repositories/adminRepository.js';
import { AppConfigRepository } from '../repositories/appConfigRepository.js';
import { AuditLogRepository } from '../repositories/auditLogRepository.js';
import { logger } from '../utils/logger.js';

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

export function setAdminCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
        ? 'Set ADMIN_EMAILS or ADMIN_UIDS in server environment (e.g. .env, then restart npm run dev:full).'
        : `Signed in as uid=${identity.uid}${identity.email ? ` email=${identity.email}` : ' (no email on token)'}. Add this to ADMIN_EMAILS or ADMIN_UIDS.`;

    res.status(403).json({ error: 'Forbidden — admin access required', hint });
    return null;
  }

  return identity;
}

let indexesReady = false;

export async function withAdminContext(req, res, handler) {
  setAdminCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.MONGODB_URI) {
    return res.status(503).json({
      error: 'MongoDB not configured',
      message: 'Set MONGODB_URI in environment variables',
    });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return null;

  try {
    const db = await getDb();

    if (!indexesReady) {
      await ensureIndexes(db);
      indexesReady = true;
    }

    const ctx = {
      admin,
      adminRepo: new AdminRepository(db),
      configRepo: new AppConfigRepository(db),
      auditRepo: new AuditLogRepository(db),
    };

    return handler(ctx);
  } catch (error) {
    logger.error('Admin API error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return null;
  }
}

export function readQuery(req) {
  return req.query || {};
}
