import { DataTypes } from 'sequelize';
import sequelize from '../Connection/Sequelize.js';

const OrderStatus = sequelize.define('OrderStatus', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "status_id"
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "status_code"
    },
    name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "status_name"
    }
}, {
    tableName: 'order_status',
    timestamps: false
});

export default OrderStatus;
