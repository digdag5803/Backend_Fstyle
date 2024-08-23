import jwt from "jsonwebtoken";
let msg = "";
const middwarecontroller = {
  verifyToken: (req, res, next) => {
    if (req.headers.token) {
      // console.log("Đã đọc được token từ header: " + req.headers.token);
      const accessToken = req.headers.token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          // console.log("Token đã hết hạn hoặc không hợp lệ");
          return res.status(403).json("Token đã hết hạn hoặc không hợp lệ");
        }
        req.user = user;
        next();
      });
    } else if (req.cookies.TokenAdmin) {
      const accessToken = req.cookies.TokenAdmin;
      // console.log("Đã đọc được token từ cookie: " + accessToken);
      if (accessToken) {
        jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
          if (err) {
            // console.log("Token đã hết hạn hoặc không hợp lệ");
            return res.status(403).json("Token đã hết hạn hoặc không hợp lệ");
          }
          req.user = user;
          next();
        });
      }
    } else {
      // console.log("Bạn chưa đăng nhập");
      return res.redirect("/admin/auth/login");
    }
  },
  verifyAdmin: (req, res, next) => {
    middwarecontroller.verifyToken(req, res, () => {
      if (!req.user) {
        return res.redirect("/admin/auth/login");
      } else {
        if (req.user.admin === "success") {
          next();
        } else {
          console.log("Bạn không có quyền truy cập");
          return res.status(403).json("Bạn không có quyền truy cập");
        }
      }
    });
  },

  verifyUser: (req, res, next) => {
    // console.log(req.headers)
    if (req.headers.token) {
      // console.log("Token từ user gửi đến sever: " + req.headers.token);
      const accessToken = req.headers.token.split(" ")[1];
      console.log(accessToken);
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          // console.log("Token đã hết hạn hoặc không hợp lệ");
          return res.status(403).json("Token đã hết hạn hoặc không hợp lệ");
        }
        req.user = user;
        console.log("Đã xác thực token");
        next();
      });
    } else if (req.headers.authorization) {
      let accessToken = req.headers.authorization.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          // console.log("unauthn token");
          return res.status(403).json("unauth token");
        }
        req.user = user;
        next();
      });
    } else {
      // console.log("Bạn chưa đăng nhập");
      return res.status(403).json("Bạn chưa đăng nhập");
    }
  },
};
export default middwarecontroller;
