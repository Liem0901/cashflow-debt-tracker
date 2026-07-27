import { withAdminContext } from '../lib/adminHandler.js';

export default async function handler(req, res) {
  await withAdminContext(req, res, async ({ adminRepo }) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const stats = await adminRepo.getDashboardStats();
    return res.status(200).json(stats);
  });
}
