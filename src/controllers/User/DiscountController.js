import VoucherService from "../../services/VoucherService.js";
import AuthUser from "../../models/auth.model.js";
import pool from "../../config/Connection.js";
const VoucherController = {
  index: async (req, res) => {
    try {
      if (req.user.user_id) {
        const result = await VoucherService.getListVoucher(req.user.user_id);
        console.log("result", result);
        const kq = result.map((item) => {
          let usage_remaining1;
          if (item.use_history == null){
            usage_remaining1 = item.usage_quantity;
          }else if(item.usage_quantity == 0){

            usage_remaining1 = 1- (JSON.parse(item.use_history).length);
          }
          else{
            usage_remaining1 = item.usage_quantity - (JSON.parse(item.use_history).length);
          }
          return {
            voucher_id: item.voucher_id,
            voucher_name: item.voucher_name,
            voucher_code: item.voucher_code,
            start_time: item.start_time,
            end_time: item.end_time,
            voucher_type: item.voucher_type,
            reward_type: item.reward_type,
            usage_quantity: item.usage_quantity,
            discount_amount: item.discount_amount,
            max_price: item.max_price,
            voucher_purpose: item.voucher_purpose,
            usage_remaining:usage_remaining1,
          };
         
        });
        res.status(200).json(kq);
      }
    } catch (e) {
      console.log(e.message);
    }
  },
  findandaddvoucherformuser : async (req, res) => {
    const { voucher_code } = req.body;
    const userId = req.user.user_id;
  
    try {
      // Fetch user role from the database
      const userItem = await AuthUser.findOne({
        where: { user_id: userId },
        attributes: ['role'],
      });
  
      if (!userItem) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        // Check if the voucher exists
        const [rows] = await connection.query(
          "SELECT * FROM vouchers WHERE voucher_code = ?",
          [voucher_code]
        );
  
        if (rows.length === 0) {
          return res.status(404).json({ message: "Voucher not found" });
        }
  
        const voucher = rows[0];
        const useHistoryUser = JSON.parse(voucher.use_history) || [];
        const userIdList = JSON.parse(voucher.item_user_id_list) || [];
        const usageQuantity = JSON.parse(voucher.usage_quantity) || [];
  
        if (voucher.voucher_purpose === 0 && userItem.role === 0) {
          if (useHistoryUser.includes(userId)) {
            return res.status(200).json({ message: "Bạn đã sử dụng voucher này rồi", success: true });
          } else if (userIdList.includes(userId)) {
            return res.status(200).json({ message: "Voucher đã tồn tại trong giỏ của bạn", success: true });
          } else if (usageQuantity.length === useHistoryUser.length) {
            return res.status(200).json({ message: "Số lượng voucher đã hết hoặc đã hết hạn", success: true });
          } else {
            await connection.query(
              `UPDATE vouchers
               SET item_user_id_list = JSON_ARRAY_APPEND(COALESCE(item_user_id_list, JSON_ARRAY()), '$', ?)
               WHERE voucher_code = ?;`,
              [userId, voucher_code]
            );
            return res.status(200).json({ message: "Đã thêm voucher vào giỏ của bạn", success: true });
          }
        } else {
          return res.status(403).json({ message: "Voucher không hợp lệ cho bạn", success: false });
        }
      } catch (queryError) {
        console.error('Query processing error:', queryError);
        return res.status(500).json({ error: "Error processing voucher query" });
      } finally {
        //Giải phóng kết nối trở lại hồ bơi
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching user or database connection:', error);
      return res.status(500).json({ error: "Error handling voucher" });
    }
  },
};
export default VoucherController;
