import { withAdminContext, readQuery } from '../lib/adminHandler.js';

export default async function handler(req, res) {
  await withAdminContext(req, res, async ({ adminRepo }) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const query = readQuery(req);
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);

    const result = await adminRepo.listUsers({
      search: query.search || '',
      page,
      limit,
      disabled: query.disabled ?? null,
    });

    return res.status(200).json(result);
  });
}
