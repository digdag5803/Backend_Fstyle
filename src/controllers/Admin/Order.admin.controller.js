import { or } from "sequelize";
import { OrderService } from "../../services/OrderService.js";
import OrderStatus from "../../models/OrderStatus.js";
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import { Expo } from "expo-server-sdk";

const layout = "layouts/layout";

const OrderController = {
  index: async (req, res) => {
    try {
      const orders = await OrderService.getAllOrder();
      const orderStatus = await OrderStatus.findAll();
      const mapOrderToPayload = (order) => {
        return {
          id: order.id,
          user: {
            userId: order.userId,
            username: order.User.username,
            phone: order.User.phone,
            fullName: order.User.full_name,
            email: order.User.email,
          },
          orderDate: parseOrderDate(order.orderDate),
          shippingAddress: {
            id: order.ShippingAddress.id,
            userId: order.ShippingAddress.userId,
            fullContact: `
            ${order.ShippingAddress.state},
             ${order.ShippingAddress.city},
              ${order.ShippingAddress.recipientPhoneNumber}`,
          },
          deliveredAddress: order.deliveredAddressId,
          paymentStatus: order.paymentStatus,
          paymentMethod: {
            id: order.PaymentMethodType.id,
            paymentMethodName: order.PaymentMethodType.paymentMethodName,
          },
          transactionCode: order.transactionCode,
          orderStatus: {
            id: order.OrderStatus.id,
            code: order.OrderStatus.code,
            status: order.OrderStatus.name,
          },
          totalAmount: (+order.totalAmount).toLocaleString(),
        };
      };
      const parseOrderDate = (orderDate) => {
        const date = new Date(orderDate);
        const optionsDate = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };
        const optionsTime = { hour: "2-digit", minute: "2-digit" };

        const formattedDate = new Intl.DateTimeFormat(
          "vi-VN",
          optionsDate
        ).format(date);
        const formattedTime = new Intl.DateTimeFormat(
          "vi-VN",
          optionsTime
        ).format(date);

        return `${formattedDate} ${formattedTime}`;
      };
      const ordersPayload = [];
      await orders.map((order) => {
        ordersPayload.push(mapOrderToPayload(order));
      });
      const serverUrl = process.env.HOST_NAME;
      console.log(ordersPayload);
      res.render("order/order", {
        title: "Quản lý đơn hàng",
        layout: layout,
        data: {
          orders: ordersPayload,
          orderStatus: orderStatus,
          serverUrl: serverUrl,
        },
      });
    } catch (error) {
      console.log(error);
    }
  },
  show: async (req, res) => {
    const serverUrl = process.env.HOST_NAME;
    const id = req.params.id;
    console.log(id);
    const order = await OrderService.getOrderById(id);
    const orderStatus = await OrderStatus.findAll();
    console.log(JSON.stringify(order));
    // const orderStatus = await OrderStatus.findAll();
    const mapOrderToPayload = (order) => {
      return {
        id: order.id,
        user: {
          userId: order.userId,
          username: order.User.username,
          phone: order.User.phone,
          fullName: order.User.full_name,
          email: order.User.email,
        },
        orderDate: parseOrderDate(order.orderDate),
        shippingAddress: {
          id: order.ShippingAddress.id,
          userId: order.ShippingAddress.userId,
          fullContact: `
            ${order.ShippingAddress.state},
             ${order.ShippingAddress.city},
              ${order.ShippingAddress.recipientPhoneNumber}`,
        },
        deliveredAddress: order.deliveredAddressId,
        paymentStatus: order.paymentStatus,
        paymentMethod: {
          id: order.PaymentMethodType.id,
          paymentMethodName: order.PaymentMethodType.paymentMethodName,
        },
        transactionCode: order.transactionCode,
        orderStatus: {
          id: order.OrderStatus.id,
          code: order.OrderStatus.code,
          status: order.OrderStatus.name,
        },
        orderDetail: mapArrayOrderDetail(order.OrderDetails).result,
        freightCost: (+order.freightCost).toLocaleString(),
        discount: (
          +order.totalAmount -
          (mapArrayOrderDetail(order.OrderDetails).totalSoldAmount +
            +order.freightCost)
        ).toLocaleString(),
        totalAmount: (+order.totalAmount).toLocaleString(),
      };
    };
    const mapArrayOrderDetail = (orderDetails) => {
      const result = [];
      let totalSoldAmount = 0;
      for (const detail of orderDetails) {
        // console.log(JSON.stringify(detail))
        result.push({
          detailId: detail.id,
          productDetailId: detail.productDetailId,
          productId: detail.ProductDetail.Product.product_id,
          quantity: detail.quantity,
          soldPrice: (+detail.price).toLocaleString(),
          currentPrice: detail.ProductDetail.Product.price,
          color: detail.ProductDetail.color,
          size: detail.ProductDetail.size,
          productName: detail.ProductDetail.Product.product_name,
          thumbnail: detail.ProductDetail.Product.thumbnail,
          amount: (detail.quantity * detail.price).toLocaleString(),
        });
        totalSoldAmount += detail.quantity * detail.price;
      }
      return { result: result, totalSoldAmount: totalSoldAmount };
    };
    const parseOrderDate = (orderDate) => {
      const date = new Date(orderDate);
      const optionsDate = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const optionsTime = { hour: "2-digit", minute: "2-digit" };

      const formattedDate = new Intl.DateTimeFormat(
        "vi-VN",
        optionsDate
      ).format(date);
      const formattedTime = new Intl.DateTimeFormat(
        "vi-VN",
        optionsTime
      ).format(date);

      return `${formattedDate} ${formattedTime}`;
    };
    const orderDto = mapOrderToPayload(order);
    console.log(JSON.stringify(orderDto));
    res.render("order/orderDetail", {
      title: "Chi tiết đơn hàng",
      layout: layout,
      data: {
        id: id,
        order: orderDto,
        orderStatus: orderStatus,
        serverUrl: serverUrl,
      },
    });
  },
  update: async (req, res) => {
    let dto = req.body;
    dto = { ...dto, orderId: +req.params.id };
    try {
      const { orderId, statusId } = dto;
      if (
        !(orderId || statusId) ||
        isNaN(orderId) ||
        isNaN(statusId) ||
        orderId <= 0 ||
        statusId <= 0
      ) {
        console.log("400 1");
        res.status(400).json({ message: "invalid payload" });
        return;
      }
      const order = await Order.findByPk(orderId, {
        include: {
          model: User,
          attributes: ["notify_token"],
        },
      });

      const expo = new Expo();
      const pushToken = order.User.notify_token;
      console.log(pushToken);

      await Order.update(
        {
          statusId: statusId,
        },
        {
          where: {
            id: orderId,
          },
        }
      );
      if (!Expo.isExpoPushToken(pushToken)) {
        console.log(`Push token ${pushToken} is not a valid Expo push token`);
      } else {
        let body = "";
        let chunks;
        if (statusId == 2) {
          console.log(statusId)
          body = "Đơn hàng đã được của hàng xác nhận,vui lòng chờ vận chuyển.";
          chunks = expo.chunkPushNotifications([
            {
              to: pushToken,
              sound: "default",
              title: "Trạng thái đơn hàng mới cập nhật",
              body: body,
              data: { type: "ORDERSTATUS", status: "PROCESSING" },
            },
          ]);
        } else if (statusId == 3) {
          console.log(statusId)
          body = "Đơn hàng đang được vận chuyển,vui lòng chờ giao hàng.";
          chunks = expo.chunkPushNotifications([
            {
              to: pushToken,
              sound: "default",
              title: "Trạng thái đơn hàng mới cập nhật",
              body: body,
              data: { type: "ORDERSTATUS", status: "SHIPPING" },
            },
          ]);
        } else if (statusId == 4) {
          console.log(statusId)
          body =
            "Đơn hàng đã được vận chuyển, hãy xác nhận đơn hàng và đánh giá đơn hàng nhé.";
          chunks = expo.chunkPushNotifications([
            {
              to: pushToken,
              sound: "default",
              title: "Trạng thái đơn hàng mới cập nhật",
              body: body,
              data: { type: "ORDERSTATUS", status: "SHIPPED" },
            },
          ]);
        }

        let tickets = [];
        (async () => {
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
              tickets.push(...ticketChunk);
            } catch (error) {
              console.error(error);
            }
          }
        })();
        console.log("send message oke");
        let receiptIds = [];
        for (let ticket of tickets) {
          if (ticket.id) {
            receiptIds.push(ticket.id);
          }
        }
      }

      res.status(200).json({ message: "ok" });
      return;
    } catch (e) {
      console.log(e);
      console.log("400 2");
      res.status(400).json({ message: "invalid payload" });
      return;
    }
  },
};
export default OrderController;
