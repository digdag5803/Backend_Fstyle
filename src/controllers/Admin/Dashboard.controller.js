const layout = "layouts/layout";
import Order from "../../models/Order.js";
import sequelize from "../../Connection/Sequelize.js";
import { Op } from "sequelize";
const DashboardController = {
  index: async (req, res) => {
    // const currentMonth = new Date().getMonth() + 1; // Note: Months are zero-indexed, so we add 1

    // Generate an array with months from 1 to 12
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    // Example: Get monthly data for the current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Note: Months are zero-indexed, so we add 1

    const startMonth =
      currentMonth - 6 <= 0 ? 12 + (currentMonth - 6) : currentMonth - 6;

    const monthlyRecord = await Order.findAll({
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("order_date")), "month"],
        [sequelize.fn("COUNT", sequelize.col("*")), "orderCount"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "totalAmount"],
      ],
      where: {
        orderDate: {
          [Op.between]: [
            new Date(currentYear, startMonth - 1, 1), // Start of the 6 months ago
            new Date(currentYear, currentMonth - 1, 31, 23, 59, 59, 999), // End of the current month
          ],
        },statusId: {
          [Op.ne]: 6, // Exclude records where statusId is 6
        },
        paymentStatus: 'PAID'
      },
      group: [sequelize.fn("MONTH", sequelize.col("order_date"))],
      raw: true,
    });

    const monthlyDataMap = Object.fromEntries(
      monthlyRecord.map((item) => [item.month, item])
    );

    // Merge the results with all months, filling in zero values for missing months
    const monthlyDataMapResult = allMonths.map((month) => ({
      month,
      orderCount:
        (monthlyDataMap[month] && monthlyDataMap[month].orderCount) || 0,
      totalAmount:
        (monthlyDataMap[month] && monthlyDataMap[month].totalAmount) || "0.00",
    }));
    console.log(monthlyDataMapResult);
    res.render("Screen/dashboard", {
      title: "Dashboard",
      layout: layout,
      data: {
        monthlyData: monthlyDataMapResult,
      },
    });
  },
  alert: (req, res) => {
    res.render("Screen/discount", { title: "Alert", layout: layout });
  },
};
export default DashboardController;
