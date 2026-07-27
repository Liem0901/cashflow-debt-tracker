import { withAdminContext, readQuery } from '../lib/adminHandler.js';

export default async function handler(req, res) {
  await withAdminContext(req, res, async ({ adminRepo }) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const query = readQuery(req);
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 50, 200);

    const result = await adminRepo.listAllTransactions({
      userId: query.userId || '',
      type: query.type || '',
      category: query.category || '',
      dateFrom: query.dateFrom || '',
      dateTo: query.dateTo || '',
      page,
      limit,
    });

    return res.status(200).json(result);
  });
}
