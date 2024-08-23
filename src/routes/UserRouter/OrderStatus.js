import express from "express";
import OrderStatus from "../../models/OrderStatus.js";
const router = express.Router();

router.get('', async (req, res) => {
  try {
    return res.status(200).json(await OrderStatus.findAll());
  } catch (err) {
    return res.status(500).json({message: err.message})
  }
})

export default router;