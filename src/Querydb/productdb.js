const Queryproduct = {
  GetListProducts: `
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
        LEFT JOIN
            orders o ON od.order_id = o.order_id
        WHERE
            o.status_id IS NULL OR o.status_id <> 6
        GROUP BY
            p.product_id
        ORDER BY
            total_quantity_sold DESC
        LIMIT ? OFFSET ?;
    `,
  GetSolidProductById: `
  SELECT
  SUM(od.quantity) AS total_quantity_sold
FROM
  products p
JOIN
  product_details pd ON p.product_id = pd.product_id
LEFT JOIN
  order_details od ON pd.detail_id = od.product_detail_id
WHERE
  p.product_id = ?
GROUP BY
  p.product_id, pd.detail_id
ORDER BY
  total_quantity_sold DESC;
    `,
  GetRatingById: `SELECT product_id, AVG(rating) AS averageRating
  FROM product_ratings
  WHERE product_id = ?
  GROUP BY product_id;`,
  Rating: `INSERT INTO product_ratings (user_id, product_id, rating)
  VALUES (?, ?, ?);
  `,
};

export default Queryproduct;
