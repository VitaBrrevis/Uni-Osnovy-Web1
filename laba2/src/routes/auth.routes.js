import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User, Role } from '../models/index.js';
import { issueToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /auth/register
 * body: { username, password }
 * За замовчуванням видаємо роль USER
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'username & password required' });

    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(409).json({ message: 'username taken' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash });

    const userRole = await Role.findOne({ where: { value: 'USER' } });
    await user.addRole(userRole);

    const token = await issueToken(user.id);
    res.status(201).json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /auth/login
 * body: { username, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Bad credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Bad credentials' });

    const token = await issueToken(user.id);
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
