import { DataTypes } from "sequelize";
import sequelize from "../Connection/Sequelize.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(100),
    },
    full_name: {
      type: DataTypes.STRING(100),
    },
    address: {
      type: DataTypes.STRING(255),
    },
    gender: {
      type: DataTypes.STRING(255),
    },
    avatar: {
      type: DataTypes.STRING(255),
    },
    date_of_birth: {
      type: DataTypes.DATE,
    },
    notify_token: {
      type: DataTypes.STRING(200),
      allowNull: true,
      unique: true,
      defaultValue: null,
      field: 'notify_token',
    }
  },
  { 
    sequelize,
    tableName: "users",
    createdAt: false,
    updatedAt: false,
  }
);
// User.association = function(models) {
//   User.hasMany(models.Cart, { foreignKey: 'user_id' })
// }

export default User;
