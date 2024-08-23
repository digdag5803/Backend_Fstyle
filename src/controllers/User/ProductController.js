import connection from "../../config/Connection.js";
import ProductService from "../../services/ProductService.js";
import ProductDb from "../../Querydb/productdb.js";
import pool from "../../config/Connection.js";
const ProductController = {
  index : async (req, res) => {
    const skip = parseInt(req.query.skip, 10) || 0; // Default to 0 if `skip` is not provided
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if `limit` is not provided
  
    // Validate `skip` and `limit`
    if (isNaN(skip) || isNaN(limit) || skip < 0 || limit <= 0) {
      return res.status(400).json({ error: 'Invalid skip or limit parameters' });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Execute the query
        const [rows] = await connection.query(ProductDb.GetListProducts, [limit, skip]);
  
        // Process data received from the database
        const data = rows.map((row) => ({
          id: row.product_id,
          name: row.product_name,
          price: row.product_price,
          description: row.product_description,
          thumbnail: row.thumbnail,
          total_quantity_sold: row.total_quantity_sold,
        }));
  
        // Send data back to the client
        res.status(200).json({ data });
      } catch (queryError) {
        console.error('Database query error:', queryError);
        res.status(500).json({ error: 'Database query error' });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: 'Error connecting to database' });
    }
  },

  // const dataJson = {
  //   "product_id": 63,
  //   "product_name": "434",
  //   "product_description": "",
  //   "product_price": "3434.00",
  //   "category_id": 2,
  //   "thumbnail": "https://i.ibb.co/WWbhHhF/ao.png",
  //   "ProductImages": [
  //     {
  //       "image_url": "[\"https://i.ibb.co/WWbhHhF/ao.png\",\"https://i.ibb.co/HNBzgqj/argentina.png\",\"https://i.ibb.co/3pLGNFT/campuchia.png\"]"
  //     }
  //   ],
  //   "ProductDetails": [
  //     {
  //       "detail_id": 61,
  //       "product_id": 63,
  //       "color": "red",
  //       "size": "L",
  //       "stock": 10
  //     }
  //   ],
  //   "Category": {
  //     "category_id": 2,
  //     "name": "Running Shoes",
  //     "image": null
  //   }
  // };
  show: async (req, res) => {
    ProductService.getProductById(req.params.id)
      .then((product) => {
        if (product) {
          const imagesString = product.ProductImages[0].image_url;
          const parsedImages = JSON.parse(imagesString);
          const resBody = {
            id: product.product_id,
            name: product.product_name,
            price: product.product_price,
            quantity: product.product_quantity,
            description: product.product_description,
            thumbnail: product.thumbnail,
            images: parsedImages,
            ProductDetails: product.ProductDetails,
            Category: product.Category,
          };
          res.status(200).json(resBody);
        } else {
          res.status(404).json({ message: "not found" });
        }
      })
      .catch((e) => {
        res.status(500).json({ message: e.message });
      });
  },
  GetSolidProductById : async (req, res) => {
    const id = req.params.id;
  
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
  
    const query = ProductDb.GetSolidProductById;
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Execute the query
        const [rows] = await connection.query(query, [id]);
  
        // Check if any rows are returned
        if (rows.length === 0) {
          return res.status(404).json({ message: `Product with ID ${id} not found` });
        }
  
        // Map the rows to a structured format
        const data = {
          total_quantity_sold: rows[0].total_quantity_sold,
        };
  
        // Send the data back to the client
        res.status(200).json(data);
      } catch (queryError) {
        console.error('Database query error:', queryError);
        res.status(500).json({ error: 'Server error' });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  },


  GetRatingById : async (req, res) => {
    const id = req.params.id;
    const query = ProductDb.GetRatingById;
  
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Execute the query
        const [rows] = await connection.query(query, [id]);
  
        // Check if any rows are returned
        if (rows.length === 0) {
          return res.status(404).json({ message: `Product with ID ${id} not found` });
        }
  
        // Process the result
        const result = rows[0];
        if (result.averageRating) {
          result.averageRating = Math.round(parseFloat(result.averageRating));
        }
  
        // Send the data back to the client
        res.status(200).json(result);
      } catch (queryError) {
        console.error('Database query error:', queryError);
        res.status(500).json({ error: 'Server error' });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  }
,  

Rating : async (req, res) => {
  const user_id = req.user.user_id;
  const product_id = req.params.id;
  const rating = parseInt(req.query.score);

  // Validate the rating value
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating value" });
  }

  if (!product_id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const checkQuery = "SELECT * FROM product_ratings WHERE user_id = ? AND product_id = ?";
  const updateQuery = "UPDATE product_ratings SET rating = ?, rating_date = NOW() WHERE user_id = ? AND product_id = ?";
  const insertQuery = "INSERT INTO product_ratings (user_id, product_id, rating) VALUES (?, ?, ?)";

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    try {
      // Check if the user has already rated the product
      const [rows] = await connection.query(checkQuery, [user_id, product_id]);

      if (rows.length > 0) {
        // User has already rated the product, update the existing rating
        await connection.query(updateQuery, [rating, user_id, product_id]);
        res.status(200).json({ status: 1, message: "Rating updated successfully" });
      } else {
        // User has not rated the product, insert a new rating
        await connection.query(insertQuery, [user_id, product_id, rating]);
        res.status(200).json({ status: 1, message: "Rating added successfully" });
      }
    } catch (queryError) {
      console.error('Database query error:', queryError);
      res.status(500).json({ error: 'Server error' });
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  } catch (connectionError) {
    console.error('Database connection error:', connectionError);
    res.status(500).json({ error: 'Unexpected server error' });
  }
},
};

export default ProductController;
