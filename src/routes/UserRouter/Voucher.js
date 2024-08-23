import express from "express";
import DiscountController from "../../controllers/User/DiscountController.js";
import middwarecontroller from "../../middleware/middwarecontroller.js";
const router = express.Router();

router.get('',middwarecontroller.verifyUser,DiscountController.index);
router.post('/find-voucher',middwarecontroller.verifyUser,DiscountController.findandaddvoucherformuser);

// router.get('/:id',ProductController.show);

export default router;