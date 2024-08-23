import express from "express";
import querystring from "qs";
import crypto from "crypto";
import moment from "moment";
import Order from "../../models/Order.js";
import { or, where } from "sequelize";
import middwarecontroller from "../../middleware/middwarecontroller.js";

const router = express.Router();

router.post(
  "/create_payment_url",
  middwarecontroller.verifyUser,
  async function (req, res, next) {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    // let config = require('config');

    let tmnCode = process.env.VNP_TMNCODE;
    let secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURNURL;
    let transactionId = moment(date).format("DDHHmmss");

    const userId = req.user.user_id;
    const bankCode = req.body?.bankCode;
    const orderId = req.body?.orderId;
    const locale = req.body?.language;

    if (locale === null || locale === "") {
      locale = "vn";
    }
    const orderFounded = await Order.findByPk(orderId);
    if (!orderFounded) {
      res.status(404).json({ message: "not found order #", orderId });
    } else if (orderFounded.userId !== userId) {
      res
        .status(403)
        .json({
          message: `user #${userId} can not permisstion to interact with order #${orderId}`,
        });
      return;
    }
    const amount = orderFounded.totalAmount * 100
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = transactionId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + transactionId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }
    console.log(JSON.stringify(orderFounded));
    
    const orderUpdated = await Order.update(
      {
        transactionCode: transactionId,
      },
      {
        where: {
          id: orderId,
          userId: userId,
        },
      }
    );
    console.log(orderUpdated)
    if (orderUpdated[0] === 1) {
      console.log("found and updated transaction code in order #", orderId);
      vnp_Params = sortObject(vnp_Params);
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      //TODO: update database
      res.json({ url: vnpUrl });
    } else {
      console.log(orderUpdated)
      res.status(500).json({ message: "server error" });
    }
  }
);

router.get("/vnpay_return", function (req, res, next) {
  let vnp_Params = req.query;

  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  let tmnCode = process.env.VNP_TMNCODE;
  let secretKey = process.env.VNP_HASHSECRET;

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

    res.send({ code: vnp_Params["vnp_ResponseCode"] });
  } else {
    res.send({ code: "97" });
  }
});

router.get("/vnpay_ipn", async function (req, res, next) {
  // console.log('vnp call')
  let vnp_Params = req.query;
  console.log(vnp_Params);
  let secureHash = vnp_Params["vnp_SecureHash"];

  let orderId = vnp_Params["vnp_TxnRef"];
  let rspCode = vnp_Params["vnp_ResponseCode"];
  let amount = vnp_Params["vnp_Amount"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = process.env.VNP_HASHSECRET;
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  let paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
  //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
  //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó
  const order = await Order.findOne({
    where: {
      transactionCode: orderId,
    },
  });
  let checkOrderId = false || order?.transactionCode === orderId; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
  let checkAmount = false || order?.totalAmount === (amount / 100).toFixed(2); // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
  if (secureHash === signed) {
    //kiểm tra checksum
    if (checkOrderId) {
      if (checkAmount) {
        if (paymentStatus == "0") {
          //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
          if (rspCode == "00") {
            //thanh cong
            //paymentStatus = '1'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
            await Order.update(
              {
                paymentStatus: "PAID",
              },
              {
                where: {
                  transactionCode: orderId,
                },
              }
            );
            console.log("success");
            res.status(200).json({ RspCode: "00", Message: "Success" });
          } else {
            //that bai
            //paymentStatus = '2'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
            console.log("faild");
            res.status(200).json({ RspCode: "-01", Message: "close payment" });
          }
        } else {
          console.log("02");
          res.status(200).json({
            RspCode: "02",
            Message: "This order has been updated to the payment status",
          });
        }
      } else {
        console.log("04");
        res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
      }
    } else {
      console.log("01");
      res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }
  } else {
    console.log("97");
    res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
  }
});
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
export default router;
