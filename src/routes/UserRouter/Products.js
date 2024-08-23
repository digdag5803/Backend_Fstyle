import express from "express";
import ProductController from "../../controllers/User/ProductController.js";
import middwarecontroller from "../../middleware/middwarecontroller.js";
const router = express.Router();


router.get("", ProductController.index);
router.get("/:id", ProductController.show);
// router.get('/search/:name',ProductController.search);
// router.get('/category/:id',ProductController.category);
// router.get('/category/:id/search/:name',ProductController.categorySearch);
// router.get('/category/:id/sort/:sort',ProductController.categorySort);
// router.get('/category/:id/search/:name/sort/:sort',ProductController.categorySearchSort);
// router.get('/sort/:sort',ProductController.sort);
router.get("/soldcountproduct/:id", ProductController.GetSolidProductById);
router.get("/rating/:id", ProductController.GetRatingById);
router.post("/:id/rating",middwarecontroller.verifyUser, ProductController.Rating);

export default router;
