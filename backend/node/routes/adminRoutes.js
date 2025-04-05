const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getSalesReport,
  getTopProducts,
  getUserAnalytics
} = require("../controllers/adminController");

const { protect, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// @desc    Quản lý người dùng
// @access  Admin
router.get("/users", protect, isAdmin, getAllUsers);
router.get("/users/:id", protect, isAdmin, getUserById);
router.put("/users/:id", protect, isAdmin, updateUser);
router.delete("/users/:id", protect, isAdmin, deleteUser);

// @desc    Quản lý sản phẩm
// @access  Admin
router.get("/products", protect, isAdmin, getAllProducts);
router.delete("/products/:id", protect, isAdmin, deleteProduct);

// @desc    Quản lý đơn hàng
// @access  Admin
router.get("/orders", protect, isAdmin, getAllOrders);
router.put("/orders/:id", protect, isAdmin, updateOrderStatus);

// @desc    Dashboard và báo cáo
// @access  Admin
router.get("/dashboard", protect, isAdmin, getDashboardStats);
router.get("/reports/sales", protect, isAdmin, getSalesReport);
router.get("/reports/top-products", protect, isAdmin, getTopProducts);
router.get("/reports/user-analytics", protect, isAdmin, getUserAnalytics);

module.exports = router;
