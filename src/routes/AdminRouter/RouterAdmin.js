import express from "express";
const router = express.Router();
import authRouter from "./AuthAdmin.js";
import ProductAdmin from "./ProductAdmin.js";
import Dashboard from "./Dashboard.js";
import VoucherAdmin from "./VoucherAdmin.js";
import User from "./UserAdmin.js";
import Order from "./OrderAdmin.js";
import Analytic from "./AnalyticAdmin.js";
import middwarecontroller from "../../middleware/middwarecontroller.js";
import Category from "./Category.js";
import Notify from "./Notify.js";

router.use("/", Dashboard);
router.use("/admin/auth", authRouter);
router.use("/admin/products", ProductAdmin);
router.use("/admin/voucher", VoucherAdmin);
router.use("/admin/users", User);
router.use("/admin/orders", middwarecontroller.verifyAdmin, Order);
router.use("/admin/analytic", Analytic);
router.use("/admin/categories", Category);
router.use("/admin/notify", Notify);

// khi nào làm thì ae nhớ tách lẻ file ra như ở RouterUser nhé
export default router;
