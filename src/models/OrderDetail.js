import { DataTypes } from "sequelize";
import sequelize from "../Connection/Sequelize.js";

const OrderDetail = sequelize.define('OrderDetail', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: "order_detail_id"
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "order_id"
  },
  productDetailId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "product_detail_id"
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "quantity",
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    field: "price",
  },
}, {
  tableName: 'order_details',
  timestamps: false
})

export default OrderDetail