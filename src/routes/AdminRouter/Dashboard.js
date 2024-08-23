import express from "express";
import DashboardController from "../../controllers/Admin/Dashboard.controller.js";
const router = express.Router();
import middwarecontroller from "../../middleware/middwarecontroller.js";

router.get("", middwarecontroller.verifyAdmin, (req, res) => {
  res.redirect("/admin/dashboard");
});
router.get("/admin", middwarecontroller.verifyAdmin, (req, res) => {
  res.redirect("/admin/dashboard");
});

router.get("/admin/dashboard",
  middwarecontroller.verifyAdmin,
  DashboardController.index
);
router.get("/admin/alert", DashboardController.alert);

export default router;
