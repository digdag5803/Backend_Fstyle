import User from "../models/User.js";
import pool from "../config/Connection.js";

const UserService = {
  getListUser: async () => {
    try {
      const result = await User.findAll();
      return result;
    } catch (e) {
      throw new Error(e.message);
    }
  },

  getListUserAuthById: async (userId) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        "SELECT * FROM auth_users WHERE user_id = ?",
        [userId]
      );
      connection.release(); // Release the connection back to the pool
      if (rows.length === 0) {
        throw new Error(`User with id = ${userId} not found`);
      }
      const { verificationToken, refreshtoken, ...info } = rows[0];
      return info;
    } catch (err) {
      throw new Error("Server error: " + err.message);
    }
  },

  getListUserAddressById: async (userId) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        "SELECT * FROM shipping_addresses WHERE user_id = ?",
        [userId]
      );
      connection.release(); // Release the connection back to the pool
      if (rows.length === 0) {
        return {}; // Return an empty object if no address is found
      }
      const { address_id, user_id, ...info } = rows[0];
      return info;
    } catch (err) {
      throw new Error("Server error: " + err.message);
    }
  },

  getUserById: async (userId) => {
    try {
      const result = await User.findByPk(userId);
      if (!result) {
        throw new Error(`User with id = ${userId} not found`);
      }
      return result;
    } catch (e) {
      throw new Error(e.message);
    }
  },

  addUserProduct: async (userId, productId) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with id = ${userId} not found`);
      }
      await user.addProduct(productId);
      return true;
    } catch (e) {
      throw new Error(e.message);
    }
  },

  getUserProducts: async (userId) => {
    try {
      const user = await User.findByPk(userId, { include: "products" });
      if (!user) {
        throw new Error(`User with id = ${userId} not found`);
      }
      return user.products;
    } catch (e) {
      throw new Error(e.message);
    }
  },

  updateUserDetails: async (userId, updatedDetails) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with id = ${userId} not found`);
      }
      await user.update(updatedDetails);
      return true;
    } catch (e) {
      throw new Error(e.message);
    }
  },

  deleteUser: async (userId) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with id = ${userId} not found`);
      }
      await user.destroy();
      return true;
    } catch (e) {
      throw new Error(e.message);
    }
  },

  removeUserProduct: async (userId, productId) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with id = ${userId} not found`);
      }
      await user.removeProduct(productId);
      return true;
    } catch (e) {
      throw new Error(e.message);
    }
  },

  getUserDetails: async (userId) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with id = ${userId} not found`);
      }
      return user;
    } catch (error) {
      throw new Error("Error getting user details: " + error.message);
    }
  },
};

export default UserService;
