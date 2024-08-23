import { DataTypes } from "sequelize";
import sequelize from "../Connection/Sequelize.js";


const PaymentMethodType = sequelize.define('PaymentMethodType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  },
  paymentMethodName: {
    type: DataTypes.TEXT(100),
    allowNull: false,
    field: 'payment_method_name'
  }
}, {
  tableName: 'payment_method_types',
  timestamps: false,
})

export default PaymentMethodType;