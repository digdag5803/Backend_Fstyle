const Querycart = {
    GetTotalCart: `SELECT COALESCE(COUNT(cart_items.item_id), 0) AS total_items
    FROM users
    JOIN carts ON users.user_id = carts.user_id
    LEFT JOIN cart_items ON carts.cart_id = cart_items.cart_id
    WHERE users.user_id = ?
    GROUP BY users.user_id, carts.cart_id;`,
}

export default Querycart;