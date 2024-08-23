import Cart from "../../models/Cart.js";
import { CartService } from "../../services/CartService.js";
import pool from "../../config/Connection.js";
import Cartdb from "../../Querydb/Cartdb.js";

export const CartsController = {
  index: async (req, res) => {
    try {
      const carts = await CartService.getCartOfUser(req.user.user_id);
      res.status(200).json(carts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  show: async (req, res) => {
    try {
      const cart = await CartService.getCartById(req.params.id);
      if (cart) {
        if (cart.user_id === req.user.user_id) {
          res.status(200).json(cart);
        } else {
          res.status(403).json({ message: "Forbidden" });
        }
      } else {
        res.status(404).json({ message: "Cart not found" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const cart = await CartService.createCart(req.user.user_id);
      res.status(201).json(cart);
    } catch (e) {
      res.status(500).json({ message: "Server error" });
    }
  },

  update: async (req, res) => {
    try {
      const cart = await Cart.findByPk(req.params.id);
      if (cart) {
        if (cart.user_id === req.user.user_id) {
          const result = await CartService.operateItemFromCart(
            req.params.id,
            req.body.product_detail_id,
            req.body.quantity
          );
          if (result.status < 0) {
            res.status(400).json(result);
          } else {
            res.status(200).json(result);
          }
        } else {
          res.status(403).json({ message: "Forbidden" });
        }
      } else {
        res.status(404).json({ message: "Cart not found" });
      }
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  delete: async (req, res) => {
    try {
      await CartService.destroyCart(req.params.id); // Make sure to pass the cart ID to destroyCart
      await Cart.destroy({ where: { id: req.params.id } }); // Ensure this matches your ORM method
      res.status(200).json({ message: "Cart deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getTotalCart: async (req, res) => {
    const db = await pool.getConnection();
    try {
      const [rows] = await db.query(Cartdb.GetTotalCart, [req.user.user_id]);
      db.release();

      if (rows.length > 0) {
        const totalItems = rows[0].total_items;
        res.status(200).json({ total_cart_items: totalItems });
      } else {
        res.status(404).json({ message: "Not found", status: 0 });
      }
    } catch (error) {
      db.release();
      res.status(500).json({ message: error.message });
    }
  },
};
