import FavoritesService from "../../services/favoritesservice.js";
const FavoritesController = {
  getFavorites: async (req, res) => {
    console.log("req.user.user_id");
    try {
      if (req.user.user_id) {
        const result = await FavoritesService.getFavorites(req.user.user_id);
        const data = result.map((item) => {
          return {
            idFavorite: item.id,
            id: item.product_id,
            name: item.Product.product_name,
            description: item.Product.product_description,
            price: item.Product.product_price,
            ProductCategory: item.Product.category_id,
            thumbnail: item.Product.thumbnail,
          };
        });
        res.status(200).json(data);
      }
    } catch (e) {
      console.log(e.message);
    }
  },

  addFavorites: async (req, res) => {
    try {
      if (req.user.user_id) {
        const result = await FavoritesService.addFavorites(
          req.user.user_id,
          req.body.productId
        );
        res.status(200).json({ success: true, message: "Add success" });
      }
    } catch (e) {
      console.log(e.message);
    }
  },
  deleteFavorites: async (req, res) => {
    try {
      if (req.user.user_id) {
        const result = await FavoritesService.deleteFavorites(
          req.user.user_id,
          req.params.productId
        );
        res.status(200).json({ message: "Delete success", success: true });
      }
    } catch (e) {
      console.log(e.message);
    }
  },
  checkIfProductIsFavorite: async (req, res) => {
    try {
      if (!req.user || !req.user.user_id) {
        return res.status(400).json({ success: false, message: 'User ID is missing' });
      }

      console.log("req.user.user_id", req.user.user_id);
      console.log(req.params.productId);

      const isFavorite = await FavoritesService.getFavoriteByProductId(
        req.user.user_id,
        req.params.productId
      );
      res.status(200).json({
        success: true,
        isFavorite: isFavorite || false,
        message: isFavorite ? 'Product is in favorites' : 'Product not found in favorites'
      });
    } catch (e) {
      console.error(e.message); 
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },



  getcountFavorites: async (req, res) => {
    try {
      if (req.user.user_id) {
        const result = await FavoritesService.getcountFavorites(
          req.user.user_id,
        );
        res.status(200).json({ value: result, message: "Lấy số lượng thích thành công", success: "thành công" });
      }
    } catch (e) {
      console.log(e.message);
    }
  },
  getAllCountFavorites: async (req, res) => {
    //Nhận tất cả ID người dùng trong cơ sở dữ liệu
    const productId=req.params.productId;
    try {
      const result = await FavoritesService.getAllCountFavorites(productId);
      res.status(200).json({ value: result, message: "Lấy tổng số thích của tất cả người dùng", success: "thành công" });
    } catch (e) {
      console.log(e.message);
    }
  },

};
export default FavoritesController;
