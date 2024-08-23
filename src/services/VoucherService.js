import Discount from "../models/Voucher.js";
import AuthUser from "../models/auth.model.js";

import connection from "../config/Connection.js";
import Voucher from "../models/Voucher.js";
import pool from "../config/Connection.js";
const VoucherService = {
  createVoucher: async (voucher) => {
    try {
      const result = await Discount.create(voucher);
      return result;
    } catch (e) {
      throw e.message;
    }
  },
  updateVoucher: async (voucher) => {
    try {
      const result = await Discount.update(voucher, {
        where: {
          voucher_id: voucher.voucher_id,
        },
      });
      return result;
    } catch (e) {
      throw e.message;
    }
  },
  deleteVoucher: async (voucher) => {
    try {
      const result = await Discount.destroy({
        where: {
          voucher_id: voucher.voucher_id,
        },
      });
      return result;
    } catch (e) {
      throw e.message;
    }
  },

  Getvoucherbyid: async (voucher) => {
    try {
      const result = await Discount.findOne({
        where: {
          voucher_id: voucher.voucher_id,
        },
      });
      return result;
    } catch (e) {
      throw e.message;
    }
  },
  getListVoucherAdmin: async () => {
    try {
      const result = await Discount.findAll();
      return result;
    } catch (e) {
      throw e.message;
    }
  },
    getListVoucher: async (user_id) => {
      const queryTemp = `
        SELECT *
        FROM vouchers
        WHERE (voucher_purpose IN (0, 1))
          AND (
            JSON_SEARCH(item_user_id_list, 'one', ?) IS NOT NULL
            AND (
              use_history IS NULL
              OR JSON_SEARCH(use_history, 'one', ?) IS NULL
            )
          );    
      `;
      try {
        // Get user role from AuthUser model
        const user = await AuthUser.findOne({
          where: {
            user_id: user_id,
          },
          attributes: ["role"],
        });
  
        if (!user) {
          throw new Error(`User with id ${user_id} not found`);
        }
  
        console.log("user.dataValues.role", user.dataValues.role);
  
        if (user.dataValues.role == 0) {
          // Use the connection pool to execute the query
          const connection = await pool.getConnection();
          try {
            const [rows] = await connection.query(queryTemp, [user_id, user_id]);
            return rows.length > 0 ? rows : [];
          } finally {
            connection.release(); // Always release the connection back to the pool
          }
        } else {
          return { status: false };
        }
      } catch (e) {
        throw new Error(e.message);
      }
    },
  voucherValidating: async ({ userId, vouchers }) => {
    let error = [];
    const currentTime = new Date();
    console.log(
      "current time: ",
      currentTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    for (const voucher of vouchers) {
      const userIds = await JSON.parse(voucher.item_user_id_list);
      const voucherUseHistory = await JSON.parse(voucher.use_history);
      const startDateTime = new Date(voucher.start_time * 1000);
      const endDateTime = new Date(voucher.end_time * 1000);
      console.log(
        voucher.voucher_id,
        startDateTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
        endDateTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      if (currentTime < startDateTime) {
        error.push({
          voucherId: voucher.voucher_id,
          userId: userId,
          message: "voucher hasn't started yet",
        });
      } else if (endDateTime < currentTime) {
        error.push({
          voucherId: voucher.voucher_id,
          userId: userId,
          message: "voucher is expired",
        });
      } else if (!userIds.includes(userId)) {
        error.push({
          voucherId: voucher.voucher_id,
          userId: userId,
          message: "user have not voucher",
        });
      } else if (voucher.use_history) {
        if (voucherUseHistory.length >= voucher.usage_quantity) {
          error.push({
            voucherId: voucher.voucher_id,
            userId: userId,
            message: "Quantity voucher has run out",
          });
        } else if (voucherUseHistory.includes(userId)) {
          error.push({
            voucherId: voucher.voucher_id,
            userId: userId,
            message: "user has been this voucher",
          });
        }
      }
    }
    if (error.length > 0) {
      console.log(error);
      return { status: false, error: error };
    }
    return { status: true };
  },
  useVouchers: async (userId, vouchers) => {
    let discountAmount = 0;
    for (const voucher of vouchers) {
      let { discount_amount, use_history } = voucher;
      discountAmount += discount_amount;
      if (typeof use_history === "string") {
        use_history = JSON.parse(use_history);
      }
      if (!Array.isArray(use_history)) {
        use_history = [];
      }

      if (!use_history.includes(userId)) {
        use_history.push(userId);
      }

      console.log(use_history);

      await Voucher.update(
        {
          use_history: JSON.stringify(use_history),
        },
        {
          where: {
            voucher_id: voucher.voucher_id,
          },
        }
      );
    }
    return discountAmount;
  },
};
export default VoucherService;
