import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";
import ProductImage from "../models/ProductImage.js";
export const ProductService = {
  // getListProduct: async () => {
  //   try {
  //     const result = await Product.findAll({
  //       include: [
  //         {
  //           // model: [Category, ProductDetail, ProductImage],
  //           model: Category,
  //           attributes: ["name", "image"],
  //         },
  //       ],
  //     });
  //     return result;
  //   } catch (e) {
  //     throw e.message;
  //   }
  // },
  getListProduct: async () => {
    try {
      const result = await Product.findAll({
        include: [
          ProductDetail,
          {
            model: Category,
            attributes: ["name", "image"],
          },
        ],
      });
      return result;
    } catch (e) {
      throw e.message;
    }
  },

  getProductById: async (productId) => {
    try {
      const result = await Product.findByPk(productId, {
        include: [
          {
            model: ProductImage,
            attributes: ["image_url"],
          },
          {
            model: ProductDetail,
          },
          {
            model: Category,
          },
        ],
      });
      return result;
    } catch (e) {
      throw e.message;
    }
  },

  createProduct: async (
    product_name,
    product_price,
    product_description,
    thumbnail,
    category_id,
    image_url,
    quantity,
    color,
    size,
    items
  ) => {
    console.log("product_name", product_name);
    console.log("product_price", product_price);
    console.log("product_description", product_description);
    console.log("thumbnail", thumbnail);
    console.log("category_id", category_id);
    console.log("image_url", image_url);
    console.log("quantity", quantity);
    console.log("color", color);
    console.log("size", size);
    console.log("items", items);
    try {
      // Tạo sản phẩm

      const createdProduct = await Product.create({
        product_name,
        product_description,
        product_price,
        category_id,
        thumbnail,
      });
      const product_id = createdProduct.product_id;
      if (items !== undefined) {
        for (const detail of items) {
          const { color, size, stock } = detail;

          // Thêm bản ghi vào cơ sở dữ liệu
          await ProductDetail.create({
            product_id,
            color: color,
            size: size,
            stock: stock,
            quantity: quantity,
          });
        }
      } else {
        await ProductDetail.create({
          product_id,
          color: color,
          size: size,
          stock: quantity,
          quantity: quantity,
        });
      }
      const urls = image_url;
      await ProductImage.create({
        image_url: urls,
        product_id,
      });

      return createdProduct;
    } catch (e) {
      throw e.message;
    }
  },
  canAddToCart: async (productDetailId, quantity) => {
    const productDetail = await ProductDetail.findByPk(productDetailId);
    return productDetail.stock >= quantity;
  },
  // Cập nhật thông tin sản phẩm
  //TODO: need to fix
  updateProduct: async (
    productId,
    product_name,
    product_price,
    category_id,
    thumbnail,
    detail_color,
    detail_size,
    detail_stock,
    product_description
  ) => {
    try {
      const [updatedProduct] = await Product.update(
        {
          product_name,
          product_price,
          product_description,
          category_id,
          thumbnail,
        },
        {
          where: {
            product_id: productId,
          },
        }
      );
  
      let detailUpdates = [];
      for (let i = 0; i < detail_color.length; i++) {
        const updatedDetail = await ProductDetail.update(
          {
            color: detail_color[i],
            size: detail_size[i],
            stock: detail_stock[i],
          },
          {
            where: {
              product_id: productId,
              // Additional criteria to match the specific detail, if necessary
            },
          }
        );
        detailUpdates.push(updatedDetail);
      }
  
      // If you have more updates like ProductImage, include them here as well
  
      return {
        mainProduct: updatedProduct,
        detailUpdates: detailUpdates,
        // Include any other relevant update information here
      };
    } catch (error) {
      throw error;
    }
  },
  
  //TODO: need to fix
  deleteProduct: async (productId) => {
    try {
      // Xóa thông tin ảnh sản phẩm
      await ProductImage.destroy({
        where: {
          product_id: productId,
        },
      });
      await ProductDetail.destroy({
        where: {
          product_id: productId,
        },
      });
      const deletedProductCount = await Product.destroy({
        where: {
          product_id: productId,
        },
      });
      console.log("aaaa", deletedProductCount);
      return deletedProductCount > 0;
    } catch (e) {
      throw e.message;
    }
  },
  //TODO: need to fix
  getProductDetail: async (productId) => {
    try {
      const productDetail = await ProductDetail.findOne({
        where: {
          product_id: productId,
        },
      });

      const productImage = await ProductImage.findOne({
        where: {
          product_id: productId,
        },
      });

      if (productDetail && productImage) {
        return {
          color: productDetail.color,
          size: productDetail.size,
          stock: productDetail.stock,
          quantity: productDetail.quantity,
          image_url: JSON.parse(productImage.image_url),
        };
      } else {
        return null; // Hoặc bạn có thể throw một lỗi nếu không tìm thấy thông tin chi tiết
      }
    } catch (e) {
      throw e.message;
    }
  },
  GetFullIdProduct: async () => {
    try {
      const result = await Product.findAll({
        attributes: ["product_id"],
      });
      return result;
    } catch (e) {
      throw e.message;
    }
  },
};
export default ProductService;
