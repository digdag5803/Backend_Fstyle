import exxpress from "express";
import middwarecontroller from "../../middleware/middwarecontroller.js";
import { OrderController } from "../../controllers/User/OrderController.js";

const router = exxpress.Router();

router.get("/", middwarecontroller.verifyUser, OrderController.index);
router.post("/", middwarecontroller.verifyUser, OrderController.create);
// chỉ định id là số để không bị lỗi
router.patch(
  "/:id(\\d+)/cancel",
  middwarecontroller.verifyUser,
  OrderController.cancel
);
router.patch(
  "/:id(\\d+)/verify-delivered",
  middwarecontroller.verifyUser,
  OrderController.verifyDelivered
);
router.get(
  "/total-order-status/",
  middwarecontroller.verifyUser,
  OrderController.totalOrderStatus
);
export default router;
