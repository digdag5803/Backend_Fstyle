import Users from "../../models/User.js";
import AuthAdmin from "../../models/auth.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let msg = "";
const layout = "layouts/layout";
const authAdminController = {
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.user_id,
        admin: "success",
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "30d" }
    );
  },
  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.user_id,
        admin: "success",
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  },
  loginAdmin: async (req, res, next) => {
    const { username, password } = req.body;

    if (req.method == "POST") {
      try {
        const user = await Users.findOne({ where: { username: username } });

        if (user) {
          // const validPassword = await bcrypt.compare(password, user.password);
          const validPassword = password === user.password;

          if (validPassword) {
            const authAdmin = await AuthAdmin.findOne({
              where: { user_id: user.user_id },
            });

            if (authAdmin && authAdmin.role == 1) {
              const accesstokens =
                authAdminController.generateAccessToken(authAdmin);

              // Set a cookie and update the refresh token
              res.cookie("TokenAdmin", accesstokens, {
                httpOnly: true,
                path: "/",
                sameSite: "strict",
                secure: false,
              });

              await AuthAdmin.update(
                {
                  refreshtoken:
                    authAdminController.generateRefreshToken(authAdmin),
                },
                { where: { user_id: user.user_id } }
              );
              return res.redirect("/admin/dashboard");
            } else {
              res.render("login/login", {
                msg: "Bạn không có quyền truy cập !",
                layout: layout,
                title: "Đăng nhập",
              });
            }
          } else {
            res.render("Login/login", {
              msg: "Tài khoản hoặc mật khẩu không đúng !",
              layout: layout,
              title: "Đăng nhập",
            });
          }
        }
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }

    // If none of the conditions are met, render the login page with the appropriate message
    if (req.method == "GET") {
      return res.render("Login/login", {
        msg,
        layout: layout,
        title: "Đăng nhập",
      });
    }
  },

  refreshToken: async (req, res) => {},
  logoutAdmin: async (req, res, next) => {
    res.clearCookie("TokenAdmin");
    console.log("Đăng xuất thành công");
    res.redirect("/admin/auth/login");
  },
};

export default authAdminController;
