import express from "express";
const router = express.Router();
import Notification from "../../controllers/Admin/Notify.admin.controller.js";
router.post("/push", Notification.pushNotification);
export default router;
