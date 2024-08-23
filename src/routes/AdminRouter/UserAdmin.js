import express from "express";
import UserAdminController from "../../controllers/Admin/User.Admin.controller.js";
import middwarecontroller from "../../middleware/middwarecontroller.js";

const router = express.Router();

// Hiển thị danh sách người dùng và sản phẩm của họ
router.get("",middwarecontroller.verifyAdmin, UserAdminController.index);

router.get("/create", UserAdminController.createUserForm);
router.post("/create", UserAdminController.createUser);

router.get("/detail/:id", UserAdminController.detailUser);

// Hiển thị form sửa thông tin người dùng
router.get("/edit/:id", UserAdminController.edit);

// Cập nhật thông tin người dùng sau khi sửa đổi
router.post("/update/:id", UserAdminController.update);

// Xóa người dùng
router.delete("/delete/:id", UserAdminController.delete);

export default router;
