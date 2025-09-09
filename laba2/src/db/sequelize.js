import { Sequelize } from 'sequelize';
import { config } from '../config/config.js';

export const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: false,
  }
);

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established.');
  } catch (e) {
    console.error('❌ MySQL connection failed:', e.message);
    process.exit(1);
  }
}
