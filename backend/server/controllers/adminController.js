import { verifyAuthTokenFull } from '../config/firebase.js';
import {
  withAdminContext,
  readQuery,
  isAdminIdentity,
  setAdminCors,
} from '../middleware/adminMiddleware.js';

async function handleMe(req, res) {
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

async function handleDashboard(req, res) {
  await withAdminContext(req, res, async ({ adminRepo }) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const stats = await adminRepo.getDashboardStats();
    return res.status(200).json(stats);
  });
}

async function handleUsers(req, res, userId) {
  await withAdminContext(req, res, async ({ admin, adminRepo, auditRepo }) => {
    if (userId) {
      if (req.method === 'GET') {
        const user = await adminRepo.getUserDetail(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
      }

      if (req.method === 'PATCH') {
        const { disabled } = req.body || {};
        if (typeof disabled !== 'boolean') {
          return res.status(400).json({ error: 'disabled (boolean) is required' });
        }

        const ok = await adminRepo.setUserDisabled(userId, disabled);
        if (!ok) {
          return res.status(404).json({ error: 'User not found' });
        }

        await auditRepo.log({
          adminId: admin.uid,
          adminEmail: admin.email,
          action: disabled ? 'user.disable' : 'user.enable',
          targetUserId: userId,
        });

        return res.status(200).json({ ok: true, userId, disabled });
      }

      if (req.method === 'DELETE') {
        const ok = await adminRepo.deleteUser(userId);
        if (!ok) {
          return res.status(404).json({ error: 'User not found' });
        }

        await auditRepo.log({
          adminId: admin.uid,
          adminEmail: admin.email,
          action: 'user.delete',
          targetUserId: userId,
        });

        return res.status(200).json({ ok: true, userId });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

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

async function handleTransactions(req, res) {
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

async function handleCategories(req, res) {
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

async function handleReports(req, res) {
  await withAdminContext(req, res, async ({ adminRepo }) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const reports = await adminRepo.getReports();
    return res.status(200).json(reports);
  });
}

export async function handleAdmin(req, res, segments) {
  const [resource, id] = segments;

  switch (resource) {
    case 'me':
      return handleMe(req, res);
    case 'dashboard':
      return handleDashboard(req, res);
    case 'users':
      return handleUsers(req, res, id);
    case 'transactions':
      return handleTransactions(req, res);
    case 'categories':
      return handleCategories(req, res);
    case 'reports':
      return handleReports(req, res);
    default:
      return res.status(404).json({ error: 'Not found' });
  }
}
