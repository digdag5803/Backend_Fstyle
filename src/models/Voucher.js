import { DataTypes } from 'sequelize';
import sequelize from '../Connection/Sequelize.js';

const Voucher = sequelize.define('Voucher', {
  voucher_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  voucher_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  voucher_code: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  voucher_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reward_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usage_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  max_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  
  item_product_id_list: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  item_user_id_list: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  voucher_purpose:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  use_history: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'vouchers',
  createdAt: false,
  updatedAt: false,
});

export default Voucher;
