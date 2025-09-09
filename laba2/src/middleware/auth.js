import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User, Role } from '../models/index.js';

export function authRequired(req, res, next) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload; // { id, username, roles }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function hasRole(roleName) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (!roles.includes(roleName)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

// Хелпер для побудови JWT
export async function issueToken(userId) {
  const user = await User.findByPk(userId, { include: Role });
  const roles = user.Roles.map(r => r.value);
  return jwt.sign(
    { id: user.id, username: user.username, roles },
    config.jwtSecret,
    { expiresIn: config.jwtExpires }
  );
}
