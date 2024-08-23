import Categorydb from "../../Querydb/Categorydb.js";
import Category from "../../models/Category.js";
import pool from "../../config/Connection.js";
const CategoryController = {
  // get all categories
  getCategoryName: async (req, res) => {
    try {
      const categories = await Category.findAll();
      res.status(200).json(categories);
      console.log("Lấy danh mục thành công");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi lấy danh mục" });
    }
  },
  // get category by id

  Categoryid : async (req, res) => {
    const categoryId = req.params.id;
    console.log(categoryId);
  
    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Query the database for the category
        const [rows] = await connection.query(
          Categorydb.getCategorybyid,
          [categoryId]
        );
  
        if (rows.length === 0) {
          return res.status(404).json({ message: "Category not found" });
        }
  
        // Map the result to the desired format
        const data = rows.map((row) => ({
          id: row.product_id,
          name: row.product_name,
          price: row.product_price,
          description: row.product_description,
          thumbnail: row.thumbnail,
          total_quantity_sold: row.total_quantity_sold,
        }));
  
        res.status(200).json(data);
        console.log("Successfully fetched category by ID");
      } catch (queryError) {
        console.error('Query processing error:', queryError);
        res.status(500).json({ error: "Error fetching category data" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Error getting connection:', error);
      res.status(500).json({ error: "Error connecting to database" });
    }
  }
};

export default CategoryController;
