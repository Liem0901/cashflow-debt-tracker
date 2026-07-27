import { getDb, getUserId } from './lib/mongodb.js';
import { isAuthConfigured, verifyAuthToken } from './lib/auth.js';
import { validateAppData, AppDataService, ensureIndexes } from './models/index.js';

let indexesReady = false;

async function getAppDataService() {
  const db = await getDb();

  if (!indexesReady) {
    await ensureIndexes(db);
    indexesReady = true;
  }

  return new AppDataService(db);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.MONGODB_URI) {
    return res.status(503).json({
      error: 'MongoDB not configured',
      message: 'Set MONGODB_URI in environment variables',
    });
  }

  let userId = null;

  if (isAuthConfigured()) {
    userId = await verifyAuthToken(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    userId = getUserId();
  }

  try {
    const appData = await getAppDataService();

    if (req.method === 'GET') {
      const result = await appData.load(userId);
      if (result?.disabled) {
        return res.status(403).json({ error: 'Account disabled' });
      }
      if (!result) {
        return res.status(200).json({ data: null, updatedAt: null });
      }

      return res.status(200).json({
        data: result.data,
        updatedAt: result.updatedAt,
        version: result.version,
      });
    }

    if (req.method === 'PUT') {
      const existing = await appData.load(userId);
      if (existing?.disabled) {
        return res.status(403).json({ error: 'Account disabled' });
      }

      const { data } = req.body || {};
      const validationErrors = validateAppData(data);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Invalid data format',
          details: validationErrors,
        });
      }

      const result = await appData.save(userId, data);

      return res.status(200).json({
        ok: true,
        updatedAt: result.updatedAt,
        version: result.version,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
