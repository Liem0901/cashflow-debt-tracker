import { withAdminContext } from '../../lib/adminHandler.js';

export default async function handler(req, res) {
  const userId = req.query.userId;

  await withAdminContext(req, res, async ({ admin, adminRepo, auditRepo }) => {
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
  });
}
