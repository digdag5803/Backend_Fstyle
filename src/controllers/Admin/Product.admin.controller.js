import ProductService from "../../services/ProductService.js";
import CategoryService from "../../services/CategoryService.js";
import ProductDetail from "../../models/ProductDetail.js";
import Category from "../../models/Category.js";
import Product from "../../models/Product.js";
const layout = "layouts/layout";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductAdminController = {
  index: async (req, res) => {
    try {
      const row = await ProductService.getListProduct();

      const data = row.map((row) => {
        const parseArrayProductDetail = (productDetails) => {
          return productDetails.map((e) => {
            return {
              color: e.color,
              size: e.size,
              stock: e.stock,
              detailId: e.detail_id,
              productId: e.product_id,
            };
          });
        };

        return {
          id: row.product_id,
          name: row.product_name,
          price: formatCurrency(row.product_price), // Định dạng giá thành VNĐ
          description: row.product_description,
          thumbnail: row.thumbnail,
          ProductDetails: parseArrayProductDetail(row.ProductDetails),
          category: {
            name: row.Category.name,
            image: row.Category.image,
          },
        };
      });

      res.render("product/products", {
        data,
        layout: layout,
        title: "Products",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
  },
  create: async (req, res) => {
    if (req.method === "POST") {
      const {
        product_name,
        product_price,
        product_description,
        product_image,
        category_id,
        quantity,
        color,
        size,
        items,
      } = req.body;
      const imageArray = JSON.parse(`[${product_image}]`);
      const thumbnail = imageArray[0];
      const image_url1 = imageArray;
      const image_url = image_url1;
      const result = await ProductService.createProduct(
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
      );
      if (result) {
        res.redirect("/admin/products");
        res.end();
      }
    } else {
      const result = await CategoryService.getAllCategories();
      const data = result.map((row) => {
        return {
          id: row.category_id,
          name: row.name,
        };
      });
      res.render("product/addProduct", {
        layout: layout,
        title: "Create Product",
        category: data,
      });
    }
  },

  edit: async (req, res) => {
    const productId = req.params.id;
    const {
      product_name,
      product_price,
      category_id,
      thumbnail,
      detail_color,
      detail_size,
      detail_stock,
      product_description,
    } = req.body; // Lấy thông tin từ request body

    try {
     
      if (req.method === "POST") {
        const result = await ProductService.updateProduct(
          productId,
          product_name,
          product_price,
          category_id,
          thumbnail,
          detail_color,
          detail_size,
          detail_stock,
          product_description
        );
        console.log("productId", productId);
        if (result) {
          res.redirect("/admin/products");
        }
      } else {
        const product = await Product.findByPk(productId);
        const productDetails = await ProductDetail.findAll({
          where: { product_id: productId },
          attributes: ["detail_id", "color", "size", "stock"],
        });
        const categories = await CategoryService.getAllCategories();

        res.render("product/editProduct", {
          layout: layout,
          title: "Edit Product",
          product: {
            id: product.product_id,
            name: product.product_name,
            // price: formatCurrency(product.product_price),
            price: product.product_price,
            description: product.product_description,
            thumbnail: product.thumbnail,
            category_id: product.category_id,
            quantity: product.quantity,
            productDetails: productDetails.map((detail) => ({
              detailId: detail.detail_id,
              productId: detail.product_id,
              color: detail.color,
              size: detail.size,
              stock: detail.stock,
            })),
          },
          categories: categories.map((category) => ({
            id: category.category_id,
            name: category.name,
            selected: category.id === product.category_id ? "selected" : "",
          })),
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Xóa sản phẩm
  delete: async (req, res, next) => {
    const productId = req.params.id;
    console.log("đang xoá ", productId);

    try {
      const result = await ProductService.deleteProduct(productId);
      if (result) {
        res.end();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  detail: async (req, res) => {
    const productId = req.params.id;

    try {
      const product = await Product.findOne({
        where: { product_id: productId },
        include: [
          {
            model: ProductDetail,
            where: { product_id: productId },
            attributes: ["detail_id", "color", "size", "stock"],
          },
          {
            model: Category,
            attributes: ["name", "image"],
          },
        ],
      });

      const categories = await CategoryService.getAllCategories();

      res.render("product/detailsProduct", {
        layout: layout,
        title: "Product Detail",
        product: {
          id: product.product_id,
          name: product.product_name,
          price: product.product_price,
          description: product.product_description,
          thumbnail: product.thumbnail,
          color: product.ProductDetails.map((detail) => detail.color),
          size: product.ProductDetails.map((detail) => detail.size),
          stock: product.ProductDetails.map((detail) => detail.stock),
          category: {
            name: product.Category.name,
            image: product.Category.image,
          },
          categories: categories, // Truyền danh sách các danh mục xuống view nếu cần thiết
        },
      });
    } catch (error) {
      console.error("Error fetching product detail:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

export default ProductAdminController;
