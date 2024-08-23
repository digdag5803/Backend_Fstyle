import { DataTypes, TEXT } from "sequelize";
import sequelize from "../Connection/Sequelize.js";

const ShippingAddress = sequelize.define('ShippingAddress', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: 'address_id',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  recipientName: {
    type: DataTypes.TEXT(100),
    allowNull: false,
    field: 'recipient_name',
  },
  city: {
    type: DataTypes.TEXT(100),
    allowNull: false,
    filed: 'city',
  },
  state: {
    type: DataTypes.TEXT(100),
    allowNull: false,
    field: 'state',
  },
  postalCode: {
    type: DataTypes.TEXT(20),
    allowNull: false,
    field: 'postal_code',
  },
  recipientPhoneNumber: {
    type: DataTypes.TEXT(50),
    allowNull: true,
    field: 'recipient_numberphone',
  },
}, {
  tableName: 'shipping_addresses',
  timestamps: false,
})

export default ShippingAddress;