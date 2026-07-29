import { isAuthConfigured, verifyAuthTokenFull } from '../config/firebase.js';
import { getUserId } from '../config/mongodb.js';

export function setUserCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function setAiCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export async function resolveUserId(req) {
  if (isAuthConfigured()) {
    const identity = await verifyAuthTokenFull(req.headers.authorization);
    if (!identity) return { userId: null, unauthorized: true, email: null };
    return { userId: identity.uid, unauthorized: false, email: identity.email };
  }

  return { userId: getUserId(), unauthorized: false, email: null };
}

export function requireMongoConfigured(res) {
  if (!process.env.MONGODB_URI) {
    res.status(503).json({
      error: 'MongoDB not configured',
      message: 'Set MONGODB_URI in environment variables',
    });
    return false;
  }
  return true;
}
