import middwarecontroller from "../../middleware/middwarecontroller.js";
import authAdminController from "../../controllers/Admin/auth.Admin.controller.js";
import express from "express";
const router = express.Router();
router.get("/login", authAdminController.loginAdmin);
router.post("/login", authAdminController.loginAdmin);
router.post("/logout",middwarecontroller.verifyToken, authAdminController.logoutAdmin);
export default router;
