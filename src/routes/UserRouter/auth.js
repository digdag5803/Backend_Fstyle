import middwarecontroller from '../../middleware/middwarecontroller.js';
import authController from '../../controllers/User/authcontroller.js';
import express from 'express';
import Cart from '../../models/Cart.js';
const router = express.Router();

router.post('/register',authController.registerUser);
router.post('/login',authController.loginUser);
router.post('/refresh_token',authController.refreshToken);
router.post('/logout',middwarecontroller.verifyToken, authController.logoutUser);
router.get('/verify/:token',authController.verifyUser, async (req, res) => {
  console.log(req.user.user_id)
});

router.post('/verify-user/:id',middwarecontroller.verifyUser, authController.ResetPassword);
router.post('/authentication-otp/:id',middwarecontroller.verifyUser,authController.authenticationOTP, authController.UpdatePassword);

export default router;