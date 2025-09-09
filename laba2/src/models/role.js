import { DataTypes, Model } from 'sequelize';

export class Role extends Model {}

export function initRole(sequelize) {
  Role.init(
    {
      value: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true
      }
    },
    { sequelize, modelName: 'Role', tableName: 'roles', timestamps: false }
  );
  return Role;
}
    