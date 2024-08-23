import pool from "../../config/Connection.js";

const SearchController = {
  SearchProductByName: async (req, res) => {
    const { name } = req.query;

    try {
      const query = `
        SELECT
          p.product_id,
          p.product_name,
          p.product_price,
          p.product_description,
          p.thumbnail,
          SUM(od.quantity) AS total_quantity_sold
        FROM
          products p
        LEFT JOIN
          product_details pd ON p.product_id = pd.product_id
        LEFT JOIN
          order_details od ON pd.detail_id = od.product_detail_id
        WHERE
          p.product_name LIKE ?
        GROUP BY
          p.product_id
        ORDER BY
          total_quantity_sold DESC;
      `;

      // Use the connection pool to run the query
      const [result] = await pool.query(query, [`%${name}%`]);

      const data = result.map((row) => ({
        id: row.product_id,
        name: row.product_name,
        price: row.product_price,
        description: row.product_description,
        thumbnail: row.thumbnail,
        total_quantity_sold: row.total_quantity_sold,
      }));

      res.status(200).json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error searching for products" });
    }
  },
};

export default SearchController;
