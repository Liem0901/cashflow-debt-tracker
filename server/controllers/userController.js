import { getDb } from '../config/mongodb.js';
import { toUtcIso } from '../utils/dates.js';
import { validateAppData } from '../schemas/appDataSchema.js';
import { AppDataService } from '../services/appDataService.js';
import { parseRequestBody } from '../utils/requestBody.js';
import {
  setUserCors,
  resolveUserId,
  requireMongoConfigured,
} from '../middleware/authMiddleware.js';
import { withErrorHandling } from '../middleware/errorMiddleware.js';

async function getAppDataService() {
  const db = await getDb();
  return new AppDataService(db);
}

export async function getUserData(req, res) {
  const appData = await getAppDataService();
  const result = await appData.load(req.userId);

  if (result?.disabled) {
    return res.status(403).json({ error: 'Account disabled' });
  }
  if (!result) {
    return res.status(200).json({ data: null, updatedAt: null });
  }

  return res.status(200).json({
    data: result.data,
    updatedAt: toUtcIso(result.updatedAt),
  });
}

export async function saveUserData(req, res) {
  const appData = await getAppDataService();
  const { data } = parseRequestBody(req);
  const validationErrors = validateAppData(data);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: 'Invalid data format',
      details: validationErrors,
    });
  }

  const existing = await appData.isAccountDisabled(req.userId);
  if (existing) {
    return res.status(403).json({ error: 'Account disabled' });
  }

  const result = await appData.save(req.userId, data);

  return res.status(200).json({
    ok: true,
    updatedAt: toUtcIso(result.updatedAt),
  });
}

export async function handleUserData(req, res) {
  setUserCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!requireMongoConfigured(res)) return;

  return withErrorHandling(res, async () => {
    const { userId, unauthorized } = await resolveUserId(req);
    if (unauthorized) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.userId = userId;

    if (req.method === 'GET') return getUserData(req, res);
    if (req.method === 'PUT') return saveUserData(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  });
}
