import { DataTypes } from "sequelize";
import sequelize from "../Conection/DbHelper.js";
import Category from "./category.model.js";
const Product = sequelize.define(
  "Product",
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    product_description: {
      type: DataTypes.TEXT,
    },
    product_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING(1500),
    },
  },
  {
    tableName: "products",
    timestamps: false,
  }
);
Product.belongsTo(Category, { foreignKey: "category_id" });
export default Product;
