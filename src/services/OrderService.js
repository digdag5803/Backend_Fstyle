import { Sequelize, or, Op } from "sequelize";
import CartItem from "../models/CartItem.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import OrderDetail from "../models/OrderDetail.js";
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";
import sequelize from "../Connection/Sequelize.js";
import OrderStatus from "../models/OrderStatus.js";
import User from "../models/User.js";
import PaymentMethodType from "../models/PaymentMethodType.js";
import ShippingAddress from "../models/ShippingAddress.js";
import Voucher from "../models/Voucher.js";
import VoucherService from "./VoucherService.js";

export const OrderService = {
  //needed authn
  getOrderOfUser: async ({ userId, statusId }) => {
    if (statusId) {
      console.log("with params");
      const result = await Order.findAll({
        where: {
          userId: userId,
          statusId: statusId,
        },
        include: [
          {
            model: OrderDetail,
            include: {
              model: ProductDetail,
              attributes: ["size", "color"],
              include: {
                model: Product,
                attributes: [
                  "product_name",
                  "product_price",
                  "thumbnail",
                  "product_id",
                ],
              },
            },
          },
          OrderStatus,
        ],
      });
      return result;
    }
    console.log("without params");
    const result = await Order.findAll({
      where: {
        userId: userId,
      },
      include: [
        {
          model: OrderDetail,
          include: {
            model: ProductDetail,
            attributes: ["size", "color"],
            include: {
              model: Product,
              attributes: [
                "product_name",
                "product_price",
                "thumbnail",
                "product_id",
              ],
            },
          },
        },
        OrderStatus,
      ],
    });
    return result;
  },
  getAllOrder: async () => {
    const orders = await Order.findAll({
      include: [User, OrderStatus, PaymentMethodType, ShippingAddress],
    });
    // console.log(JSON.stringify(orders))
    return orders;
  },
  getOrderById: async (orderId) => {
    const orders = await Order.findByPk(orderId,
      {
      include: [User, OrderStatus, PaymentMethodType, ShippingAddress,{
        model: OrderDetail,
        include: {
          model: ProductDetail,
          include: Product
        }
      }],
    });
    // console.log(JSON.stringify(orders))
    return orders;
  },
  createOrderFromCart: async ({
    userId,
    shippingAddressId,
    paymentMethodId,
    cartsId,
    cartItems,
    voucherIds,
    freightCost,
  }) => {
    //TODO: should be validate data

    const cartItemInOrder = await CartItem.findAll({
      where: Sequelize.and(
        {
          cart_id: cartsId,
        },
        Sequelize.or({
          item_id: cartItems,
        })
      ),
      include: {
        model: ProductDetail,
        attributes: ["product_id", "stock"],
        include: {
          model: Product,
          attributes: ["product_price"],
        },
      },
    });
    const cartItemIdInOrder = await cartItemInOrder.map((e) => e.item_id);
    if (cartItemInOrder.length !== cartItems.length) {
      const cartItem = await cartItems.filter(
        async (e) => !{ cartItemId: await cartItemIdInOrder.includes(e) }
      );
      return {
        status: 400,
        message: `cart items does not belong to User ${userId}`,
        data: cartItem,
      };
    }
    const error = { data: [] };
    let totalAmount = freightCost;
    if (voucherIds) {
      const vouchers = await Voucher.findAll({
        where: {
          voucher_id: {
            [Sequelize.Op.in]: voucherIds,
          },
        },
      });
      const vaildateProcess = await VoucherService.voucherValidating({
        userId: userId,
        vouchers: vouchers,
      });
      // console.log(JSON.stringify(vouchers));
      // console.log(vaildateProcess);
      if (!vaildateProcess.status) {
        error.status = 400;
        error.data = vaildateProcess.error;
        error.message = "invalid voucher id list";
        return error;
      } else {
        const discountAmount = await VoucherService.useVouchers(
          userId,
          vouchers
        );
        totalAmount -= discountAmount;
      }
    }
    for (const e of cartItemInOrder) {
      e.canOrder = true;
      if (e.quantity > e.ProductDetail.stock) {
        error.data.push({ cartItemId: e.item_id });
        e.canOrder = false;
      }
      e.amount = e.quantity * e.ProductDetail.Product.product_price;
      totalAmount += e.amount;
    }
    if (error.data.length > 0) {
      error.status = 401;
      error.message = "cannot create order with item quantity not available";
      return error;
    } else {
      const transaction = await sequelize.transaction();
      try {
        const order = await Order.create(
          {
            userId: userId,
            shippingAddressId: shippingAddressId,
            paymentMethodId: paymentMethodId,
            statusId: 1,
            freightCost: freightCost,
            totalAmount: totalAmount,
            orderDate: new Date(),
          },
          { transaction: transaction }
        );
        for (const e of cartItemInOrder) {
          await OrderDetail.create(
            {
              orderId: order.id,
              productDetailId: e.product_detail_id,
              quantity: e.quantity,
              price: e.ProductDetail.Product.product_price,
            },
            { transaction: transaction }
          );
          await CartItem.destroy({
            where: {
              item_id: e.item_id,
            },
            transaction: transaction 
          },
          );
          console.log(e.ProductDetail.stock, e.quantity)
          const newQuantity = e.ProductDetail.stock - e.quantity
          console.log(newQuantity)
          await ProductDetail.update({
            stock: +newQuantity
          }, {
            where: {
              detail_id: e.product_detail_id
            },
            transaction: transaction
          },)
        }
        await transaction.commit();
        console.log('ok')
        return {
          status: 200,
          message: "ok",
          data: order.id,
        };
      } catch (e) {
        console.log(e)
        console.log(totalAmount)
        await transaction.rollback();
        return {
          status: 500,
          message: `server error`,
        };
      }
    }
  },
  //needed authn -> authn in middleware layer
  cancelOrder: async ({ userId, orderId }) => {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderDetail,
          include: ProductDetail
        }
      ]
    });
    if (!order) {
      return {
        status: 404,
        message: "not found",
      };
    }
    const orderUserId = order.userId;
    const orderStatusId = order.statusId;
    if (orderUserId !== userId) {
      return {
        status: 403,
        message: "forbidden",
      };
    }
    if (orderStatusId !== 1 && orderStatusId !== 2) {
      return {
        status: 400,
        message: `cannot cancel an order in status isn't "PENDING" or "PROCESSING"`,
      };
    }
    console.log(JSON.stringify(order))
    const orderDetails = order.OrderDetails;
    
    const transaction = await sequelize.transaction();
    let result;
    try {
      for (const orderDetail of orderDetails) {
        const productDetailId = orderDetail.productDetailId
        const stockUpdated = orderDetail.quantity + orderDetail.ProductDetail.stock
        await ProductDetail.update({
          stock: stockUpdated
        }, {
          where: {
            detail_id: productDetailId
          },
          transaction: transaction
        })
      }
      const result = await Order.update(
        { statusId: 6 },
        {
          where: {
            id: orderId,
          },
          transaction: transaction
        }
      );
      transaction.commit();
      return {
        status: 200,
        message: `canceled ${result} order`,
      };
    } catch (e) {
      transaction.rollback();
      return {
        status: 500,
        message: 'server error'
      }
    }
  },
  verifyDeliveredOrder: async ({ userId, orderId }) => {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return {
        status: 404,
        message: "not found",
      };
    }
    const orderUserId = order.userId;
    const orderStatusId = order.statusId;
    if (orderUserId !== userId) {
      return {
        status: 403,
        message: "forbidden",
      };
    }
    if (orderStatusId !== 4) {
      return {
        status: 400,
        message: `cannot verify delivered an order in status isn't "SHIPPED"`,
      };
    } else {
      const result = await Order.update(
        {
          statusId: 5,
          paymentStatus: "PAID",
        },
        {
          where: {
            id: orderId,
          },
        }
      );
      return {
        status: 200,
        message: `verify delivered ${result} order`,
      };
    }
  },
  totalOrderStatus: async (userId) => {
    const query = `
    SELECT
    os.status_id AS status_id,
    os.status_code AS status_code,
    os.status_name AS status_name,
    COALESCE(COUNT(o.order_id), 0) AS total_orders
FROM
    order_status AS os
LEFT JOIN
    orders AS o
ON
    os.status_id = o.status_id AND o.user_id = :userId
GROUP BY
    os.status_id, os.status_code, os.status_name
`;

    try {
      const result = await sequelize.query(query, {
        replacements: { userId: userId },
        type: Sequelize.QueryTypes.SELECT,
      });
      if (result.length > 0) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },
  //admin operation
  operateOrder: async () => {},
  //user can update order if status is pending
  isOrderCanBeUpdated: async () => {},
  getOrderProcessingOfUser: async (userId) => {},
  analysicOrderInRangeOfDate: async ({ startDate, endDate }) => {
    const orders = await Order.findAll({
      where: {
        orderDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        paymentStatus: "PAID",
      },
      attributes: ["id", "orderDate", "totalAmount"],
      include: [
        {
          model: User,
          attributes: ["username", "full_name"],
        },
        {
          model: OrderDetail,
          attributes: ["price", "quantity"],
          include: {
            model: ProductDetail,
            attributes: ["size", "color"],
            include: {
              model: Product,
              attributes: ["product_name", "thumbnail"],
              include: {
                model: Category,
                attributes: ["name"],
              },
            },
          },
        },
        {
          model: OrderStatus,
          attributes: ["code", "name"],
        },
        {
          model: PaymentMethodType,
          attributes: ["paymentMethodName"],
        },
      ],
    });
    return orders;
  },
};
