import Category from "../../models/Category.js";
import CategoryService from "../../services/CategoryService.js";
import Product from "../../models/Product.js";
const CategoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({
        include: Product,
      });
      res.render("category/categories", {
        categories,
        layout: "layouts/layout",
        title: "Categories",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
  },

  createCategory: async (req, res) => {
    try {
      if (req.method == "POST") {
        const { name, image } = req.body;
        // const newCategory = await Category.create({ name, image });
      } else {
        res.render("category/addCategories", {
          // newCategory,
          layout: "layouts/layout",
          title: "Add Category",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
  },

  updateCategory: async (req, res) => {
    console.log("req.body");
    const { id } = req.params;
    const { name, image } = req.body;
    try {
      if (req.method == "GET") {
        const category = await Category.findByPk(id);
        const categorybyid = await CategoryService.getCategoryById(id);
        console.log("categorybyid", categorybyid);
        if (categorybyid) {
          res.render("category/editCategories", {
            categorybyid,
            layout: "layouts/layout",
            title: "Edit Category",
          });
        }
      } else if (req.method == "POST") {
        const category = await Category.findByPk(id);
        if (!category) {
          return res.status(404).send("Category not found");
        }
        await Category.update({ name, image }, { where: { category_id: id } });
        res.status(200).send("Category updated successfully");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
  },

  deleteCategory: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).send("Category not found");
      }

      await Category.destroy({ where: { category_id: id } });
      res.status(200).send("Category deleted successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
  },
};

export default CategoryController;
