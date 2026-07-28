import { handleUserData } from '../server/routes/userRoutes.js';
import { handleAdmin } from '../server/routes/adminRoutes.js';
import { handleAiChat } from '../server/routes/aiRoutes.js';

function getPath(req) {
  const raw = req.query.path;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string' && raw.length > 0) return raw.split('/').filter(Boolean);
  return [];
}

export default async function handler(req, res) {
  const path = getPath(req);
  const [root, ...rest] = path;

  if (root === 'data') {
    return handleUserData(req, res);
  }

  if (root === 'admin') {
    return handleAdmin(req, res, rest);
  }

  if (root === 'ai' && rest[0] === 'chat') {
    return handleAiChat(req, res);
  }

  return res.status(404).json({ error: 'Not found' });
}
