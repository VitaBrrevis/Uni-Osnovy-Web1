import { DataTypes, Model } from 'sequelize';

export class User extends Model {}

export function initUser(sequelize) {
  User.init(
    {
      username: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    },
    { sequelize, modelName: 'User', tableName: 'users', timestamps: true }
  );
  return User;
}
