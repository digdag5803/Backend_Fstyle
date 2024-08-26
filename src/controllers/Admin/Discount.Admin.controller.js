import VoucherService from "../../services/VoucherService.js";
const layout = "layouts/layout";
import ProductService from "../../services/ProductService.js";
import UserService from "../../services/UserService.js";
const VoucherAdminController = {
  index: async (req, res) => {
    try {
      const result = await VoucherService.getListVoucherAdmin();
      const data = result.map((row) => {
        const useHistoryLength = row.use_history ? row.use_history.length : 0;
        return {
          id: row.voucher_id,
          name: row.voucher_name,
          code: row.voucher_code,
          discount_amount: row.discount_amount,
          max_price: row.max_price,
          voucher_type: formatVoucherType(row.voucher_type),
          reward_type: formatVoucherReward(
            row.reward_type,
            row.discount_amount
          ),
          
          item_product_id_list: row.item_product_id_list,
          item_user_id_list: row.item_user_id_list,
          usage_quantity: row.usage_quantity,
          start_time: formatDate(row.start_time),
          end_time: formatDate(row.end_time),
          use_history: useHistoryLength,
        };
      });

      function formatDate(timestamp) {
        const date = new Date(timestamp * 1000); // Nhân với 1000 để chuyển từ giây thành mili-giây
        const day = date.getDate().toString().padStart(2, '0'); // Lấy ngày và định dạng 2 chữ số
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Lấy tháng (đánh số từ 0) và định dạng 2 chữ số
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0'); // Lấy giờ và định dạng 2 chữ số
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Lấy phút và định dạng 2 chữ số
        const seconds = date.getSeconds().toString().padStart(2, '0'); // Lấy giây và định dạng 2 chữ số
      
        return `${day}/${month}/${year} (${hours}:${minutes}:${seconds})`;
      }
      function formatVoucherType(voucherType) {
        switch (voucherType) {
          case 1:
            return "Tất cả sản phẩm";
          case 2:
            return "Sản phẩm";
          case 3:
            return "Mua Hàng";
          default:
            return "Không xác định";
        }
      }
      function formatVoucherReward(voucherReward, discount_amount) {
        switch (voucherReward) {
          case 1:
            return `Giảm giá  ${discount_amount}%`;
          case 2:
            return `Giảm giá với số tiền ${discount_amount}đ`;
          case 3:
            return "Miễn phí vận chuyển";
          default:
            return "Không xác định";
        }
      }

      res.render("voucher/voucher", {
        title: "Quản lý voucher",
        layout: layout,
        vouchers: data,
      });
      res.status(200).json({ vouchers: data });
    } catch (e) {
      console.log(e.message);
    }
  },
  create: async (req, res) => {
    const GetFullIdProduct = await ProductService.GetFullIdProduct();
    const dataFullIdProduct = await GetFullIdProduct.map(
      (row) => row.product_id
    );
    try {
      if (req.method === "POST") {
        console.log("voucher đã gửi đến", req.body);
        const {
          voucher_name,
          voucher_code,
          reward_type,
          discount_amount_phamtram,
          discount_amount_vnd,
          voucher_type,
          item_product_id_list,
          customerSelection,
          item_user_id_list,
          usage_quantity,
          start_date,
          start_time,
          end_date,
          end_time,
        } = req.body;

        let discount_amount = 0;

        if (discount_amount_phamtram !== "") {
          discount_amount = discount_amount_phamtram;
        } else if (discount_amount_vnd !== "") {
          discount_amount = discount_amount_vnd;
        }

        if (reward_type == 3) {
          discount_amount = 10000;
        }

        const item_product_id_list_arr = item_product_id_list
          .split(",")
          .map(Number);
        const item_user_id_list_arr = item_user_id_list.split(",").map(Number);

        let processedItemProductIdList = null;

        if (voucher_type == 1) {
          processedItemProductIdList = JSON.stringify(dataFullIdProduct);
        } else if (voucher_type == 2 && item_product_id_list !== "") {
          processedItemProductIdList = JSON.stringify(item_product_id_list_arr);
        }

        function dateTimeStringToTimestamp(dateString, timeString) {
          const [day, month, year] = dateString.split("-");
          const [hours, minutes] = timeString.split(":");
          const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();
          return timestamp / 1000; // Chia cho 1000 để tính theo giây
        }

        const voucher = {
          voucher_name,
          voucher_code,
          discount_amount,
          max_price: 0,
          voucher_type,
          reward_type,
          item_product_id_list: processedItemProductIdList,
          item_user_id_list:
            item_user_id_list !== ""
              ? JSON.stringify(item_user_id_list_arr)
              : null,
          usage_quantity,
          start_time: dateTimeStringToTimestamp(start_date, start_time),
          end_time: dateTimeStringToTimestamp(end_date, end_time),
          voucher_purpose: 0,
          use_history: null,
        };
        const result = await VoucherService.createVoucher(voucher);

        if (result) {
          res.redirect("/admin/voucher");
        } else {
          res.status(500).json({ message: "Error creating voucher" });
        }
      } else {
        const result = await ProductService.getListProduct();
        const dataProduct = result.map((row) => {
          return {
            id: row.product_id,
            name: row.product_name,
          };
        });

        const Userresult = await UserService.getListUser();
        const dataUser = Userresult.map((row) => {
          return {
            id: row.user_id,
            username: row.username,
          };
        });

        res.render("voucher/createvoucher", {
          layout: layout,
          title: "Create Voucher",
          products: dataProduct,
          users: dataUser,
        });
      }
    } catch (e) {
      console.error("Error in create voucher:", e.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
export default VoucherAdminController;
