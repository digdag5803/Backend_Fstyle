import { DataTypes } from 'sequelize';
import sequelize from '../Connection/Sequelize.js';
const Favorite = sequelize.define('FavoriteProduct', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    sequelize,
    tableName: 'favorites_products',
    createdAt: false,
    updatedAt: false,
  });

  
  export default Favorite;