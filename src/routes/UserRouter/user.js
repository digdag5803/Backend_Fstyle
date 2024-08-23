import express from "express";
import UserController from "../../controllers/User/Usercontroller.js";
const router = express.Router();
import middwarecontroller from '../../middleware/middwarecontroller.js';
router.get('/info-user/',middwarecontroller.verifyUser, UserController.getInfoUser);
router.put('/update-info-user/',middwarecontroller.verifyUser, UserController.updateInfoUser);
router.patch('/notify-token', middwarecontroller.verifyUser, UserController.updateVerifyToken)


export default router;