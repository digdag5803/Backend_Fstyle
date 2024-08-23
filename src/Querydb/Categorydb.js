const QueryCategory = {
  getallCategory: `select * from categories`,
  getCategorybyid: `SELECT
  products.*,
  categories.name as category_name,
  COALESCE(SUM(order_details.quantity), 0) AS total_quantity_sold
FROM categories
JOIN products ON categories.category_id = products.category_id
LEFT JOIN product_details ON products.product_id = product_details.product_id
LEFT JOIN order_details ON product_details.detail_id = order_details.product_detail_id
WHERE categories.category_id = ?
GROUP BY products.product_id, categories.name
ORDER BY total_quantity_sold DESC;
`,
};

export default QueryCategory;
