import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Product from './Product.js';
import ProductDetail from './ProductDetail.js';
import ProductImage from './ProductImage.js';
import Category from './Category.js';
import User from './User.js';
import Favorites from './Favorites.js';
import OrderStatus from './OrderStatus.js';
import Order from './Order.js';
import OrderDetail from './OrderDetail.js';
import PaymentMethodType from './PaymentMethodType.js';
import ShippingAddress from './ShippingAddress.js';
export default () => {
  console.log('associate model');
  User.hasMany(Cart, { foreignKey: 'user_id' });
  Cart.belongsTo(User, { foreignKey: 'user_id' });
  User.hasMany(ShippingAddress, {foreignKey: 'user_id'})
  CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
  Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
  CartItem.belongsTo(ProductDetail, { foreignKey: 'product_detail_id'})

  Product.hasMany(ProductDetail, { foreignKey: 'product_id' });
  ProductDetail.belongsTo(Product, { foreignKey: 'product_id' });
  
  Product.hasMany(ProductImage, { foreignKey: 'product_id' });
  ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

  Product.belongsTo(Category, { foreignKey: 'category_id' });
  Category.hasMany(Product, { foreignKey: 'category_id'})

  Favorites.belongsTo(User, { foreignKey: 'user_id' });
  User.hasMany(Favorites, { foreignKey: 'user_id' });
  Favorites.belongsTo(Product, { foreignKey: 'product_id' });
  Product.hasMany(Favorites, { foreignKey: 'product_id' });

  Order.belongsTo(OrderStatus, {foreignKey: 'status_id'})
  OrderStatus.hasMany(Order, {foreignKey: 'status_id'})

  User.hasMany(Order, {foreignKey: 'order_id'})
  Order.belongsTo(User, {foreignKey: 'user_id'})
  Order.belongsTo(PaymentMethodType, {foreignKey: 'payment_method_id'})
  Order.belongsTo(ShippingAddress, {foreignKey: 'shipping_address_id'})

  Order.hasMany(OrderDetail, {foreignKey: 'order_id'})

  OrderDetail.belongsTo(ProductDetail, {foreignKey: 'product_detail_id'})
}

