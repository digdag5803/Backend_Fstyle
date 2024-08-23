
import Favorite from '../models/Favorites.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const  FavoritesService = {
    getFavorites: async (userId) => {
        try {
            const result = await Favorite.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: Product,
                        attributes: [
                            "product_id",
                            "product_name",
                            "product_description",
                            "product_price",
                            "category_id",
                            "thumbnail"
                        ]
                    }
                ]
            })
           
            return result;
        } catch (e) {
            throw e.message;
        }
    },
    addFavorites: async (userId, productId) => {
        try {
            const result = await Favorite.create({
                user_id: userId,
                product_id: productId
            })
            return result;
        } catch (e) {
            throw e.message;
        }
    },
    deleteFavorites: async (userId, productId) => {
        try {
            const result = await Favorite.destroy({
                where: {
                    user_id: userId,
                    product_id: productId
                }
            })
            return result;
        } catch (e) {
            throw e.message;
        }
    },
    getFavoriteByProductId: async (userId, productId) => {
        try {
            const result = await Favorite.findOne({
                where: {
                    user_id: userId,
                    product_id: productId
                }
            })
            return result;
        } catch (e) {
            throw e.message;
        }
    },
    getcountFavorites: async (userId) => {
        try {
            const result = await Favorite.count({
                where: {
                    user_id: userId
                }
            })
            console.log(result);
            return result;
        } catch (e) {
            throw e.message;
        }
    },
    getAllCountFavorites: async (productId) => {
        try {
            const result = await Favorite.count({
                where: {
                    product_id: productId
                }
              
            })
            return result;
        } catch (e) {
            throw e.message;
        }
    }
    
}
export default FavoritesService;