import express from "express";
import CategoryController from "../../controllers/User/CategoryController.js";
const router = express.Router();

router.get('',CategoryController.getCategoryName);
router.get('/:id',CategoryController.Categoryid);
export default router;