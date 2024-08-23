import express from "express";
import VoucherAdminController from "../../controllers/Admin/Discount.Admin.controller.js";
import middwarecontroller from "../../middleware/middwarecontroller.js";
const router = express.Router();

router.get('',VoucherAdminController.index);
router.get('/create',middwarecontroller.verifyAdmin,VoucherAdminController.create);
router.post('/create',VoucherAdminController.create);


export default router;