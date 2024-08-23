import { DataTypes } from 'sequelize';
import sequelize from '../Connection/Sequelize.js';
import Users from './User.js';
const AuthUser = sequelize.define('auth_users', {
  auth_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  verified: {
    type: DataTypes.STRING,
    defaultValue: 'false'
  },
  auth_code: {
    type: DataTypes.INTEGER
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  refreshtoken: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'auth_users'
});
AuthUser.belongsTo(Users, { foreignKey: 'user_id' }); // Thiết lập quan hệ với Product model

export default AuthUser;
