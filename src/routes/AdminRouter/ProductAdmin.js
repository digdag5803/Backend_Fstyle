import express from "express";
import ProductAdminController from "../../controllers/Admin/Product.admin.controller.js";
import middwarecontroller from "../../middleware/middwarecontroller.js";
const router = express.Router();

router.get("/", middwarecontroller.verifyAdmin, ProductAdminController.index);
router.get(
  "/create",
  middwarecontroller.verifyAdmin,
  ProductAdminController.create
);
router.post("/create", ProductAdminController.create);

router.get(
  "/edit/:id",
  middwarecontroller.verifyAdmin,
  ProductAdminController.edit
);
router.post("/edit/:id", ProductAdminController.edit);

router.get("/detail/:id", ProductAdminController.detail);

// router.get(
//   "/delete",
//   middwarecontroller.verifyAdmin,
//   ProductAdminController.delete
// );
router.delete(
  "/delete/:id",
  middwarecontroller.verifyAdmin,
  ProductAdminController.delete
);

export default router;
