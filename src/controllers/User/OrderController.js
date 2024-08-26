import { OrderService } from "../../services/OrderService.js";

export const OrderController = {
  index: async (req, res) => {
    const userId = req.user.user_id;
    const orderStatusQueryParam = req.query?.statusCode;
    console.log(orderStatusQueryParam);
    if (orderStatusQueryParam) {
      if (
        ![
          "PENDING",
          "PROCESSING",
          "SHIPPING",
          "SHIPPED",
          "DELIVERED",
          "CANCELED",
        ].includes(orderStatusQueryParam)
      ) {
        req.status(400).json({ message: "invalid query params" });
      } else if (orderStatusQueryParam === "PENDING") {
        res
          .status(200)
          .json(await OrderService.getOrderOfUser({ userId, statusId: 1 }));
      } else if (orderStatusQueryParam === "PROCESSING") {
        res
          .status(200)
          .json(await OrderService.getOrderOfUser({ userId, statusId: 2 }));
      } else if (orderStatusQueryParam === "SHIPPING") {
        res
          .status(200)
          .json(await OrderService.getOrderOfUser({ userId, statusId: 3 }));
      } else if (orderStatusQueryParam === "SHIPPED") {
        res
          .status(200)
          .json(await OrderService.getOrderOfUser({ userId, statusId: 4 }));
      } else if (orderStatusQueryParam === "DELIVERED") {
        res
          .status(200)
          .json(await OrderService.getOrderOfUser({ userId, statusId: 5 }));
      } else {
        res
          .status(200)
          .json(await OrderService.getOrderOfUser({ userId, statusId: 6 }));
      }
    } else {
      res.status(200).json(await OrderService.getOrderOfUser({ userId }));
    }
  },
  show: async (req, res) => {},
  create: async (req, res) => {
    const dto = {
      userId: req.user?.id,
      shippingAddressId: req.body?.shippingAddressId,
      paymentMethodId: req.body?.paymentMethodId,
      cartsId: req.body?.cartId,
      freightCost: req.body?.freightCost,
      voucherIds: req.body?.voucherIds,
      cartItems: req.body?.cartItems,
    };
    console.log("dto from controller to service: ", dto);
    const result = await OrderService.createOrderFromCart(dto);
    const { status, message, data } = result;
    if (status === 200) {
      res.status(200).json({ message: message, orderId: data });
    } else if (status === 400 || status === 401) {
      res.status(400).json({ message, data });
    } else if (status === 500) {
      res.status(500).json(message);
    }
  },
  cancel: async (req, res) => {
    
    const dto = {
      userId: req.user.user_id,
      orderId: req.params.id,
    };
    console.log("cancel",req.user.user_id);
    // console.log(dto); tất cả
    const result = await OrderService.cancelOrder(dto);
    const { status, message } = result;
    res.status(status).json({ message: message });
  },
  destroy: async (req, res) => {},
  verifyDelivered: async (req, res) => {
    const dto = {
      userId: req.user.user_id,
      orderId: req.params.id,
    };
    const result = await OrderService.verifyDeliveredOrder(dto);
    const { status, message } = result;
    res.status(status).json({ message: message });
  },
  totalOrderStatus: async (req, res) => {
    const userId = req.user.user_id;
    const statusId = req.query?.statusId;

    const result = await OrderService.totalOrderStatus(userId);
    console.log("resufffflt", result);
    res
      .status(200)
      .json({
        message: "Lấy Thành công số lượng hoá đơn theo trạng thái",
        data: result,
      });
  },
};
