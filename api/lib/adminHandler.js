import { getDb } from './mongodb.js';
import { requireAdmin, setAdminCors } from './adminAuth.js';
import { ensureIndexes } from '../models/index.js';
import { AdminRepository } from '../models/adminRepository.js';
import { AppConfigRepository } from '../models/appConfigRepository.js';
import { AuditLogRepository } from '../models/auditLogRepository.js';

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
    console.error('Admin API error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return null;
  }
}

export function readQuery(req) {
  return req.query || {};
}
