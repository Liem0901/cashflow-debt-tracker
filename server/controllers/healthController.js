import { getMongoUri, pingMongo } from '../config/mongodb.js';
import { flattenApiError } from '../utils/errorText.js';

export async function handleHealth(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uriSet = Boolean(getMongoUri());

  if (!uriSet) {
    return res.status(503).json({
      ok: false,
      mongo: 'missing_uri',
      message: 'MONGODB_URI is not set in Vercel environment variables.',
    });
  }

  try {
    await pingMongo();
    return res.status(200).json({
      ok: true,
      mongo: 'connected',
      vercel: Boolean(process.env.VERCEL),
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      mongo: 'connection_failed',
      message: flattenApiError(error),
      hint: 'In Atlas → Network Access, allow 0.0.0.0/0. Then redeploy.',
    });
  }
}
