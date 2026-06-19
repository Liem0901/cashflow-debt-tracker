import { getDb, getUserId } from './lib/mongodb.js';
import { isAuthConfigured, verifyAuthToken } from './lib/auth.js';

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
    const db = await getDb();
    const collection = db.collection('users');

    if (req.method === 'GET') {
      const doc = await collection.findOne({ userId });
      if (!doc) {
        return res.status(200).json({ data: null, updatedAt: null });
      }
      return res.status(200).json({
        data: doc.data,
        updatedAt: doc.updatedAt,
      });
    }

    if (req.method === 'PUT') {
      const { data } = req.body || {};
      if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.debts)) {
        return res.status(400).json({ error: 'Invalid data format' });
      }

      const updatedAt = new Date();
      await collection.updateOne(
        { userId },
        { $set: { userId, data, updatedAt } },
        { upsert: true }
      );

      return res.status(200).json({ ok: true, updatedAt });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
