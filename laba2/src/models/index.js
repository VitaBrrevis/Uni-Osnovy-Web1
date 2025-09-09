import bcrypt from 'bcrypt';
import { sequelize, testConnection } from '../db/sequelize.js';
import { initUser, User } from './user.js';
import { initRole, Role } from './role.js';
import { initUserRole } from './userRole.js';

initUser(sequelize);
initRole(sequelize);
initUserRole(sequelize);

User.belongsToMany(Role, { through: 'user_roles' });
Role.belongsToMany(User, { through: 'user_roles' });

async function syncAndSeed() {
  await testConnection();
  await sequelize.sync(); 
  const [userRole] = await Role.findOrCreate({ where: { value: 'USER' } });
  const [adminRole] = await Role.findOrCreate({ where: { value: 'ADMIN' } });

  const adminHash = await bcrypt.hash('admin123', 10);
  const [admin] = await User.findOrCreate({
    where: { username: 'admin' },
    defaults: { password: adminHash }
  });
  await admin.addRole(adminRole);

  const userHash = await bcrypt.hash('user123', 10);
  const [user] = await User.findOrCreate({
    where: { username: 'user' },
    defaults: { password: userHash }
  });
  await user.addRole(userRole);

  console.log('✅ DB synced & seeded.');
}

const isDirectRun = (() => {
  if (!process.argv[1]) return false;
  const a = new URL(import.meta.url);
  const b = new URL(`file://${process.argv[1]}`);
  return a.pathname === b.pathname; 
})();

if (isDirectRun) {
  syncAndSeed()       
    .then(() => {
      console.log('✅ DB synced & seeded.');
      process.exit(0);
    })
    .catch((e) => {
      console.error('❌ DB sync failed:', e);
      process.exit(1);
    });
}

export { sequelize, User, Role };
