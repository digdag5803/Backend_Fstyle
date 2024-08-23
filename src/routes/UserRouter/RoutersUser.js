import express from 'express';
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js"
import userRouter from "./user.js";
import productRouter from './Products.js';
import cartRouter from './Cart.js';
import Voucher from './Voucher.js';
import Favorite from './Favorite.js';
import OrderStatusRouter from './OrderStatus.js'
import OrderRouter from './Order.js';
import Address from './Address.js'
import PaymentVnpay from './PaymentVnpay.js';
import Search from './Search.js';
const router = express.Router();

// Import các routes từ các tệp riêng lẻ
router.use('/auth', authRouter);
router.use('/categories', categoriesRouter);
router.use('/users', userRouter);
router.use('/products', productRouter);
router.use('/carts', cartRouter);
router.use('/vouchers', Voucher);
router.use('/favorites', Favorite);
router.use('/order-status', OrderStatusRouter)
router.use('/orders', OrderRouter)
router.use('/address', Address)
router.use('/payment/vnpay', PaymentVnpay)
router.use('/search', Search)
export default router;
