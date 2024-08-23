import { DataTypes } from 'sequelize';
import sequelize from '../Connection/Sequelize.js';
import Product from './Product.js';

const ProductDetail = sequelize.define('ProductDetail', {
  detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(50), // changed data type to VARCHAR(50)
    allowNull: false,
  },
  size: {
    type: DataTypes.STRING(50), // changed data type to VARCHAR(50)
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'product_details',
  createdAt: false,
  updatedAt: false,
});
// ProductDetail.associatie = function(models) {
//   ProductDetail.belongsTo(models.Product, { foreignKey: 'product_id' })
// }

export default ProductDetail;
