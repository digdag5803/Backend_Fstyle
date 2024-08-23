import middwarecontroller from "../../middleware/middwarecontroller.js";
import CategoriesController from "../../controllers/Admin/Category.admin.controller.js";
import express from "express";
const router = express.Router();
router.get("/", CategoriesController.getAllCategories);

router.get("/create", CategoriesController.createCategory);
router.post("/create", CategoriesController.createCategory);
router.post("/edit/:id", CategoriesController.updateCategory);
router.get("/edit/:id", CategoriesController.updateCategory);
export default router;
