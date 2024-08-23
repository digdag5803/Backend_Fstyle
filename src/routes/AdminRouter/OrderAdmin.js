import middwarecontroller from "../../middleware/middwarecontroller.js";
import OrderController from "../../controllers/Admin/Order.admin.controller.js";
import express from "express";
const router = express.Router();
router.get("/", OrderController.index);
router.get("/:id", OrderController.show);
router.patch("/:id", OrderController.update);

export default router;
