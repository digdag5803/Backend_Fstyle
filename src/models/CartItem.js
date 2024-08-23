import { DataTypes } from 'sequelize';
import sequelize from '../Connection/Sequelize.js';

const CartItem = sequelize.define('CartItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_detail_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'cart_items',
  createdAt: false,
  updatedAt: false,
});
// CartItem.associate = function(models) {
//   CartItem.belongsTo(models.ProductDetail, { foreignKey: 'product_detail_id' })
//   CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id' })
// }
export default CartItem;