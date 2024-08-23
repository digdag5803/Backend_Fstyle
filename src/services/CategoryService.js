import Category from "../models/Category.js";
const CategoryService = {
  getAllCategories: async () => {
    try {
      const result = await Category.findAll();
      return result;
    } catch (e) {
      throw e.message;
    }
  },
  getCategoryById: async (id) => {
    // Thêm async ở đây để sử dụng await
    try {
      const result = await Category.findByPk(id);
      return result;
    } catch (e) {
      throw e.message;
    }
  },
};

export default CategoryService;
