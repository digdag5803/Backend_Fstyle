import Queryuser from "../../Querydb/Userdb.js";
import User from "../../models/User.js";
import pool from "../../config/Connection.js";
const layout = "layouts/layout";
const UserController = {
  getInfoUser : async (req, res) => {
    const userId = req.user.user_id;
    console.log(userId);
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Query the user information
        const [result] = await connection.query(
          Queryuser.GetInfoUser,
          [userId]
        );
  
        if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
  
        const user = result[0];
        const { password, ...info } = user; // Exclude password from the response
  
        res.status(200).json({ ...info });
      } catch (queryError) {
        console.error('Query processing error:', queryError);
        return res.status(500).json({ error: "Error retrieving user information" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      res.status(500).json({ error: "Error connecting to database" });
    }
  },
  updateInfoUser : async (req, res) => {
    const userId = req.user.user_id;
    const { full_name, phone, gender, date_of_birth } = req.body;
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Execute the update query
        const [result] = await connection.query(
          Queryuser.UpdateInfoUser,
          [full_name, phone, gender, date_of_birth, userId]
        );
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }
  
        res.status(200).json({ message: "Update user successfully" });
      } catch (queryError) {
        console.error('Query processing error:', queryError);
        return res.status(500).json({ error: "Error updating user information" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      res.status(500).json({ error: "Error connecting to database" });
    }
  },
  updateVerifyToken: async (req, res) => {
    console.log(req.body)
    console.log(req.user.user_id)
    if (req.body.notifyToken) {
      const result = await User.update({
        notify_token: req.body.notifyToken
      }, {
        where: {
          user_id: req.user.user_id
        }
      })
      console.log(result)
      res.status(200).send('ok')
    } else {
      res.status(400).send({
        message: 'invalid req'
      })
    }
  }
};

export default UserController;
