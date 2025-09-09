import { Router } from 'express';
import { authRequired, hasRole } from '../middleware/auth.js';
import { User, Role } from '../models/index.js';

const router = Router();

/** GET /users  (ADMIN only) */
router.get('/', authRequired, hasRole('ADMIN'), async (req, res) => {
  const users = await User.findAll({ include: Role, attributes: ['id', 'username', 'createdAt', 'updatedAt'] });
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    roles: u.Roles.map(r => r.value),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  })));
});

/** GET /users/me  (USER/ADMIN) */
router.get('/me', authRequired, async (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, roles: req.user.roles });
});

export default router;
