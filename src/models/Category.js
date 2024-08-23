import { DataTypes } from 'sequelize';
import sequelize from '../Connection/Sequelize.js';

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(200)
    }
}, {
    tableName: 'categories',
    timestamps: false
});

export default Category;
