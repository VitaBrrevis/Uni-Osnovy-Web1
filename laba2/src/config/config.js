import 'dotenv/config';

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  jwtExpires: process.env.JWT_EXPIRES || '1d',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'auth_roles',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || ''
  }
};
