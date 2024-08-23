import express from "express";
import FavoritesController from "../../controllers/User/favoritescontroller.js";
import middwarecontroller from '../../middleware/middwarecontroller.js';
const router = express.Router();

router.get('',middwarecontroller.verifyUser,FavoritesController.getFavorites);
router.post('/create',middwarecontroller.verifyUser,FavoritesController.addFavorites);
router.delete('/delete/:productId',middwarecontroller.verifyUser,FavoritesController.deleteFavorites);
router.get('/check-favorited/:productId',middwarecontroller.verifyUser,FavoritesController.checkIfProductIsFavorite);
router.get('/count-favorites',middwarecontroller.verifyUser,FavoritesController.getcountFavorites);
router.get('/countAllFavorites/:productId',middwarecontroller.verifyUser,FavoritesController.getAllCountFavorites);

export default router;