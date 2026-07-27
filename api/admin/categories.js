import { withAdminContext } from '../lib/adminHandler.js';

export default async function handler(req, res) {
  await withAdminContext(req, res, async ({ admin, configRepo, auditRepo }) => {
    if (req.method === 'GET') {
      const config = await configRepo.getGlobalConfig();
      return res.status(200).json(config);
    }

    if (req.method === 'PUT') {
      const { expenseCategories, incomeCategories } = req.body || {};
      const config = await configRepo.updateGlobalConfig({
        expenseCategories,
        incomeCategories,
      });

      await auditRepo.log({
        adminId: admin.uid,
        adminEmail: admin.email,
        action: 'categories.update',
        meta: {
          expenseCount: config.expenseCategories.length,
          incomeCount: config.incomeCategories.length,
        },
      });

      return res.status(200).json(config);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  });
}
