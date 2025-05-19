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
  getUserAnalytics,
  getFrequentlyBoughtTogether,
  getUsers,
  getProducts,
  getOrders,
  getOrderById,
  getPendingOrders,
  getProcessingOrders,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  getCustomers,
  getCustomerById,
  getCustomerGroups,
  createCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getGeneralSettings,
  updateGeneralSettings,
  getPaymentSettings,
  updatePaymentSettings,
  getShippingSettings,
  updateShippingSettings
} = require("../controllers/adminController");

const { protect, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Add a debug endpoint handler at the top of the file
const debugDb = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const count = await Order.countDocuments();
    res.status(200).json({ message: 'Database connection working', orderCount: count });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ message: 'Database connection error', error: error.toString() });
  }
};

// @desc    Quản lý người dùng
// @access  Admin
router.get("/users", protect, isAdmin, getUsers);
router.get("/users/:id", protect, isAdmin, getUserById);
router.put("/users/:id", protect, isAdmin, updateUser);
router.delete("/users/:id", protect, isAdmin, deleteUser);

// @desc    Quản lý sản phẩm
// @access  Admin
router.get("/products", protect, isAdmin, getProducts);
router.post("/products", protect, isAdmin, require("../controllers/productController").createProduct);
router.delete("/products/:id", protect, isAdmin, deleteProduct);

// @desc    Quản lý đơn hàng
// @access  Admin
router.get("/orders", protect, isAdmin, getOrders);
router.get("/orders/:id", protect, isAdmin, getOrderById);
router.put("/orders/:id", protect, isAdmin, updateOrderStatus);
router.get("/orders/pending", protect, isAdmin, getPendingOrders);
router.get("/orders/processing", protect, isAdmin, getProcessingOrders);

// @desc    Dashboard và báo cáo
// @access  Admin
router.get("/dashboard", protect, isAdmin, getDashboardStats);
router.get("/reports/sales", protect, isAdmin, getSalesReport);
router.get("/reports/top-products", protect, isAdmin, getTopProducts);
router.get("/reports/user-analytics", protect, isAdmin, getUserAnalytics);
router.get("/reports/frequently-bought-together", protect, isAdmin, getFrequentlyBoughtTogether);

// @desc    Quản lý danh mục
// @access  Admin
router.get("/categories", protect, isAdmin, getCategories);
router.post("/categories", protect, isAdmin, createCategory);
router.get("/categories/:id", protect, isAdmin, getCategoryById);
router.put("/categories/:id", protect, isAdmin, updateCategory);
router.delete("/categories/:id", protect, isAdmin, deleteCategory);

// @desc    Quản lý thuộc tính
// @access  Admin
router.get("/attributes", protect, isAdmin, getAttributes);
router.post("/attributes", protect, isAdmin, createAttribute);
router.get("/attributes/:id", protect, isAdmin, getAttributeById);
router.put("/attributes/:id", protect, isAdmin, updateAttribute);
router.delete("/attributes/:id", protect, isAdmin, deleteAttribute);

// @desc    Quản lý khách hàng
// @access  Admin
router.get("/customers", protect, isAdmin, getCustomers);
router.get("/customers/:id", protect, isAdmin, getCustomerById);
router.get("/customers/groups", protect, isAdmin, getCustomerGroups);
router.post("/customers/groups", protect, isAdmin, createCustomerGroup);
router.put("/customers/groups/:id", protect, isAdmin, updateCustomerGroup);
router.delete("/customers/groups/:id", protect, isAdmin, deleteCustomerGroup);

// @desc    Quản lý marketing
// @access  Admin
router.get("/marketing/discounts", protect, isAdmin, getDiscounts);
router.post("/marketing/discounts", protect, isAdmin, createDiscount);
router.put("/marketing/discounts/:id", protect, isAdmin, updateDiscount);
router.delete("/marketing/discounts/:id", protect, isAdmin, deleteDiscount);
router.get("/marketing/coupons", protect, isAdmin, getCoupons);
router.post("/marketing/coupons", protect, isAdmin, createCoupon);
router.put("/marketing/coupons/:id", protect, isAdmin, updateCoupon);
router.delete("/marketing/coupons/:id", protect, isAdmin, deleteCoupon);
router.get("/marketing/banners", protect, isAdmin, getBanners);
router.post("/marketing/banners", protect, isAdmin, createBanner);
router.put("/marketing/banners/:id", protect, isAdmin, updateBanner);
router.delete("/marketing/banners/:id", protect, isAdmin, deleteBanner);

// @desc    Quản lý cài đặt
// @access  Admin
router.get("/settings/general", protect, isAdmin, getGeneralSettings);
router.put("/settings/general", protect, isAdmin, updateGeneralSettings);
router.get("/settings/payment", protect, isAdmin, getPaymentSettings);
router.put("/settings/payment", protect, isAdmin, updatePaymentSettings);
router.get("/settings/shipping", protect, isAdmin, getShippingSettings);
router.put("/settings/shipping", protect, isAdmin, updateShippingSettings);

// Add the debug route near the beginning of your routes
router.get("/debug-db", debugDb);

module.exports = router;
