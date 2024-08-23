import { DataTypes } from 'sequelize';
import sequelize from '../Connection/Sequelize.js';

const Cart = sequelize.define('Cart', {
  cart_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
}, {
  sequelize,
  tableName: 'carts',
  createdAt: false,
  updatedAt: false,
});
// Cart.associate = function(models) {
//   Cart.hasMany(models.CartItem, { foreignKey: 'cart_id' })
//   Cart.belongsTo(models.User, { foreignKey: 'user_id' })
// }

export default Cart;
