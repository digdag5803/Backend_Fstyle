import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Queryuser from "../../Querydb/Userdb.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Cart from "../../models/Cart.js";
import pool from "../../config/Connection.js";
// generate token
let refreshTokens = [];
const authController = {
  sendVerificationEmail: async (username, email, verificationToken) => {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Configure the email service or SMTP details here
      service: "gmail",
      auth: {
        user: "huynvph20687@fpt.edu.vn",
        pass: "zguosqrklrixixlo",
      },
    });
    const HOST_NAME = process.env.HOST_NAME;
    const PORT = process.env.SERVER_PORT;

    // Compose the email message
    const mailOptions = {
      from: "amazon.com",
      to: email,
      subject: "Xác thực tài khoản",
      html: `
      <div style=" text-align: center;  max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <div style="">
        <img src="https://iili.io/Jo3RUns.png" alt="Mô tả của ảnh" style="width: 50px; height: 55px; border-radius: 10px;">
      </div>
      <div style="text-align: center;">
        <h2 style="color: #007bff; font-size: 24px;">Xác thực tài khoản</h2>
      </div>
      <div style="font-style: initial; font-family: 'Times New Roman', Times, serif; font-weight: bold  ">
        <p style="color: #333; font-size: 16px; text-align: center;">Xin chào <span style="color: rgb(0, 104, 216); font-weight: bold; font-size: 20px;">'${username}'</span>,</p>
        <p style="color: #333; font-size: 16px; text-align: center;">Nhấn vào liên kết dưới đây để xác nhận tài khoản của bạn!</p>
        <p style="text-align: center;">
          <a href="http://${HOST_NAME}:${PORT}/api/v1/auth/verify/${verificationToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Xác nhận tài khoản</a>
        </p>
      </div>
    </div>
      `,
      text: `Xin chào '${username}', Bạn hãy ấn vào link để xác nhận nhé: http://${HOST_NAME}:${PORT}/api/v1/auth/verify/${verificationToken}`,
    };

    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  },
  sendVerificationOTP : async (username, email, OTP) => {
    // Validate email address
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      console.error("Invalid email address:", email);
      return;
    }
  
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "huynvph20687@fpt.edu.vn",
        pass: "mosklpvfiuqhlrij",
      },
    });
  
    // Compose the email message
    const mailOptions = {
      from: "huynvph20687@fpt.edu.vn", // Change to the sender's email address
      to: email,
      subject: "Xác thực tài khoản",
      text: `Xin chào '${username}', Mã OTP của bạn là: ${OTP}. Bạn không được chia sẻ cho bất kì ai!`,
    };
  
    // Send the email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Đã gửi otp đến email", email);
      console.log("Message ID:", info.messageId);
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  },
  verifyUser : async (req, res) => {
    const verificationToken = req.params.token;
  
    if (!verificationToken) {
      return res.status(400).json({ error: "Verification token is required" });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Check if the verification token exists
        const [results] = await connection.query(
          "SELECT * FROM auth_users WHERE verificationToken = ?",
          [verificationToken]
        );
  
        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
  
        const auth = results[0];
  
        // Update the verified field in the auth_users table
        await connection.query(
          'UPDATE auth_users SET verified = "true", verificationToken = "đã xác nhận" WHERE auth_id = ?;',
          [auth.auth_id]
        );
  
        // Create a cart for the user
        const temp = await Cart.create({
          user_id: auth.user_id
        });
  
        console.log(JSON.stringify(temp));
  
        res.status(200).json({ message: "Tài khoản đã được xác thực thành công" });
      } catch (error) {
        console.error('Query processing error:', error);
        res.status(500).json({ error: "Error processing verification" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  },
  // random 6 số
  generateRandomSixDigits() {
    const min = 0;
    const max = 999999; // Số lớn nhất có thể tạo ra với 6 chữ số
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomSixDigits = randomNumber.toString().padStart(6, "0"); // Chuyển số thành chuỗi và thêm số 0 nếu có ít hơn 6 chữ số
    return randomSixDigits;
  },
  // register
  registerUser: async (req, res) => {
    const { username, email, password, fullName } = req.body;
    console.log(req.body);
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const verificationToken = crypto.randomBytes(20).toString("hex");
      const auth_code = authController.generateRandomSixDigits();
  
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Check if username exists
        const [usernameResult] = await connection.query(
          "SELECT COUNT(*) as count FROM users WHERE username = ?",
          [username]
        );
  
        if (usernameResult[0].count > 0) {
          return res.status(400).json({
            message: "Tên đăng nhập đã tồn tại trong hệ thống!",
            success: false,
          });
        }
  
        // Check if email exists
        const [emailResult] = await connection.query(
          "SELECT COUNT(*) as count FROM users WHERE email = ?",
          [email]
        );
  
        if (emailResult[0].count > 0) {
          return res.status(400).json({
            message: "Email đã tồn tại trong hệ thống!",
            success: false,
          });
        }
  
        // Register the user
        const [result] = await connection.query(
          Queryuser.registerUser,
          [username, hashedPassword, email, fullName]
        );
        const user_id = result.insertId;
  
        // Add verification token
        await connection.query(
          "INSERT INTO auth_users (user_id, verificationToken, auth_code) VALUES (?, ?, ?)",
          [user_id, verificationToken, auth_code]
        );
  
        // Send verification email
        authController.sendVerificationEmail(username, email, verificationToken);
  
        res.status(200).json({
          message: "Đăng ký thành công!",
          success: true,
        });
        console.log("Đăng ký thành công tài khoản: " + username);
      } catch (error) {
        console.error('Query processing error:', error);
        res.status(500).json({ error: "Error processing registration" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  },
  generateAccessToken: (user) => {
    const { accessToken, ...userWithoutAccessToken } = user;

    return jwt.sign(
      {
        ...userWithoutAccessToken,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: '365d' }
    );
  },
  generateRefreshToken: (user) => {
    const { accessToken, ...userWithoutAccessToken } = user;

    return jwt.sign(
      {
        ...userWithoutAccessToken,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: '365d' }
    );
  },

  // login
  loginUser : async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username && !email) {
      return res.status(400).json({ error: "Username or email is required" });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Query to find user by username or email
        const [results] = await connection.query(
          Queryuser.loginUser,
          [username, email]
        );
  
        if (results.length === 0) {
          return res.status(404).json({ message: "Tài khoản không tồn tại!", success: false });
        }
  
        const user = results[0];
        // Verify the password
        const validPassword = await bcrypt.compare(password, user.password);
  
        if (!validPassword) {
          return res.status(401).json({ message: "Sai mật khẩu!", success: false });
        }
  
        // Check if the account is verified
        if (!user.verified) {
          return res.status(403).json({ message: "Tài khoản chưa được xác thực!", success: false });
        }
  
        // Generate tokens
        const accesstoken = authController.generateAccessToken(user);
        const refreshtoken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshtoken);
  
        // Set refresh token as a cookie
        res.cookie("refreshToken", refreshtoken, {
          httpOnly: true,
          path: "/",
          sameSite: "strict",
          secure: false,
        });
  
        res.status(200).json({ accesstoken, message: "Đăng nhập thành công", success: true });
      } catch (error) {
        console.error('Query processing error:', error);
        res.status(500).json({ error: "Error processing login" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  },

  // tạo accesstoken mới từ refreshtoken
  refreshToken: async (req, res) => {
    const rf_token = req.cookies.refreshToken;
    if (!rf_token) return res.status(401).json("Bạn chưa đăng nhập");
    if (!refreshTokens.includes(rf_token)) {
      return res.status(403).json("Refresh token không hợp lệ");
    }
    // kiểm tra refreshtoken có trong mảng refreshTokens hay không
    jwt.verify(rf_token, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log(err);
      } else {
        refreshTokens = refreshTokens.filter((token) => token !== rf_token);
        // tạo accesstoken mới và refreshtoken mới
        const newAccessToken = authController.generateAccessToken(user);
        const newRefreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(newRefreshToken); // thêm refreshtoken mới vào mảng refreshTokens
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          path: "/",
          sameSite: "strict",
          secure: false,
        });
        res.status(200).json({ accesstoken: newAccessToken });
        console.log(refreshTokens);
      }
    });
  },

  GetEmailOrPhone : async (req, res) => {
    const userid = req.params.id;
  
    if (!userid) {
      return res.status(400).json({ error: "User ID is required" });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Query to get user details by user ID
        const [results] = await connection.query(
          Queryuser.GetEmailOrPhone,
          [userid]
        );
  
        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
  
        const user = results[0];
        res.status(200).json(user);
      } catch (error) {
        console.error('Query processing error:', error);
        res.status(500).json({ error: "Error retrieving user data" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  },
  // change password
  ResetPassword : async (req, res) => {
    const { email, username, phone } = req.body;
  
    if (!username || !email || !phone) {
      return res.status(400).json({ error: "Username, email, and phone are required" });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Query to get user details
        const [results] = await connection.query(
          Queryuser.GetUserResetPassword,
          [username, email, phone]
        );
  
        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
  
        const user = results[0];
        const auth_code = authController.generateRandomSixDigits();
        console.log("Generated OTP code:", auth_code);
  
        // Update auth_code in the database
        const [updateResult] = await connection.query(
          "UPDATE auth_users SET auth_code = ? WHERE user_id = ?;",
          [auth_code, user.user_id]
        );
  
        // Respond to the client
        res.status(200).json({ message: "Reset request successful", result: updateResult });
  
        // Send verification OTP
        authController.sendVerificationOTP(user.username, user.email, auth_code);
        console.log("Password reset successful for user:", user.username);
  
      } catch (queryError) {
        console.error('Query processing error:', queryError);
        res.status(500).json({ error: "Error processing reset request" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (connectionError) {
      console.error('Database connection error:', connectionError);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  },
  // xác thực otp
  authenticationOTP : async (req, res, next) => {
    const { password, auth_code } = req.body;
    const id = req.params.id;
  
    if (!auth_code || !id) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Query to get OTP from the database
        const [results] = await connection.query(
          Queryuser.GetOtp,
          [id]
        );
  
        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
  
        const user = results[0];
  
        if (user.auth_code === auth_code) {
          if (password === undefined) {
            res.status(200).json({ message: true });
            console.log("OTP code is correct");
          } else {
            next();
          }
        } else {
          res.status(400).json({ message: "Incorrect OTP code" });
        }
      } catch (queryError) {
        console.error('Query processing error:', queryError);
        res.status(500).json({ error: "Error processing OTP verification" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (connectionError) {
      console.error('Database connection error:', connectionError);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  },
  UpdatePassword : async (req, res) => {
    const { password } = req.body;
    const id = req.params.id;
  
    if (!password || !id) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      // Generate salt and hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Update the password in the database
        const [result] = await connection.query(
          Queryuser.UpdatePassword,
          [hashedPassword, id]
        );
  
        res.status(200).json({ message: "Password updated successfully" });
      } catch (queryError) {
        console.error('Query processing error:', queryError);
        res.status(500).json({ error: "Error updating the password" });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: "Error processing request" });
    }
  },
  // logout
  logoutUser: async (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.RefreshToken
    );
    res.status(200).json("Đăng xuất thành công");

  },
};

export default authController;
