import { Model } from 'sequelize';

export class UserRole extends Model {}

export function initUserRole(sequelize) {
  UserRole.init({}, { sequelize, modelName: 'UserRole', tableName: 'user_roles', timestamps: false });
  return UserRole;
}
