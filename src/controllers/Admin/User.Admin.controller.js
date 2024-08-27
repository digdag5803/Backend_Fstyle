import UserService from "../../services/UserService.js";
const layout = "layouts/layout";

const UserAdminController = {
  index: async (req, res) => {
    try {
      const userList = await UserService.getListUser();
      const data = [];

      for (const user of userList) {
        const userAddress = await UserService.getListUserAddressbyid(user.user_id);
        data.push({
          id: user.user_id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          full_name: user.full_name,
          address: userAddress,
        });
      }

      res.render("User/users", { data, layout: layout, title: "User" });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      res.status(500).send("Lỗi máy chủ nội bộ");
    }
  }
,
  createUserForm: async (req, res) => {
    res.render("User/addUser", {
      layout: layout,
      title: "Tạo mới người dùng",
    });
  },
  createUser: async (req, res) => {
    const { username, email, password, phone, full_name, address } = req.body;
    try {
      const result = await UserService.createUser(
        username,
        email,
        password,
        phone,
        full_name,
        address
      );
      if (result) {
        res.redirect("/admin/users"); // Chuyển hướng sau khi tạo mới thành công
      } else {
        res.status(500).send("Không thể tạo mới người dùng");
      }
    } catch (error) {
      console.error("Lỗi khi tạo mới người dùng:", error);
      res.status(500).send("Lỗi máy chủ nội bộ");
    }
  },
  edit: async (req, res) => {
    const userId = req.params.id;

    try {
      const user = await UserService.getListUserbyid(userId);
      const user_auth = await UserService.getListUserAuthbyid(userId);
      const user_address = await UserService.getListUserAddressbyid(userId);
      const dateObject = new Date(user.dataValues.date_of_birth);
      console.log(user_address);
      // Lấy ngày, tháng và năm từ đối tượng Date
      const day = dateObject.getDate();
      const month = dateObject.getMonth() + 1; // Tháng bắt đầu từ 0, nên cộng thêm 1
      const year = dateObject.getFullYear();

      // Tạo chuỗi mới theo định dạng 'dd/mm/yyyy'
      const newDateString = `${day}/${month}/${year}`;
      if (user) {
        res.render("User/editUser", {
          layout: layout,
          title: "Sửa thông tin người dùng",
          user: {
            user_id: user.dataValues.user_id,
            username: user.dataValues.username,
            email: user.dataValues.email,
            phone: user.dataValues.phone,
            full_name: user.dataValues.full_name,
            address: user_address,
            gender: user.dataValues.gender,
            avatar: user.dataValues.avatar,
            date_of_birth: newDateString,
            role: user_auth.role === 1 ? true : false,
            status: user_auth.status === 1 ? true : false,
          },
        });
      } else {
        res.status(404).send("Không tìm thấy người dùng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      res.status(500).send("Lỗi máy chủ nội bộ");
    }
  },

  // Cập nhật thông tin người dùng sau khi sửa
  update: async (req, res) => {
    const userId = req.params.id;
    const updatedDetails = req.body; // Các thông tin người dùng được gửi từ form
    try {
      const result = await UserService.updateUserDetails(
        userId,
        updatedDetails
      );
      if (result) {
        res.redirect("/admin/users"); // Chuyển hướng sau khi cập nhật thành công
      } else {
        res.status(404).send("Không tìmthấy người dùng");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      res.status(500).send("Lỗi máy chủ nội bộ");
    }
  },
  detailUser: async (req, res) => {
    const userId = req.params.id;
    try {
      const user = await UserService.getUserDetails(userId);
      if (user) {
        res.render("User/detailuser", {
          layout: layout,
          title: "Chi tiết người dùng",
          user: {
            id: user.user_id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            full_name: user.full_name,
            address: user.address,
          },
        });
      } else {
        res.status(404).send("Không tìm thấy người dùng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      res.status(500).send("Lỗi máy chủ nội bộ");
    }
  },

  // Xóa người dùng
  delete: async (req, res) => {
    const userId = req.params.id;
    try {
      const result = await UserService.deleteUser(userId);
      if (result) {
        res.redirect("/admin/users"); // Chuyển hướng sau khi xóa thành công
      } else {
        res.status(404).send("Không tìm thấy người dùng");
      }
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      res.status(500).send("Lỗi máy chủ nội bộ");
    }
  },
};

export default UserAdminController;
