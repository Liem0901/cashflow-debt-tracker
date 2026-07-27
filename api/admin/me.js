import { verifyAuthTokenFull } from '../lib/auth.js';
import { isAdminIdentity, setAdminCors } from '../lib/adminAuth.js';

export default async function handler(req, res) {
  setAdminCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const identity = await verifyAuthTokenFull(req.headers.authorization);
  if (!identity) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    ...identity,
    isAdmin: isAdminIdentity(identity),
  });
}
