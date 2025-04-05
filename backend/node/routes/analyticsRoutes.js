const express = require("express");
const {
  trackUserBehavior,
  getRecommendations,
  getPopularProducts,
  getRelatedProducts
} = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// @desc    Ghi nhận hành vi người dùng
// @route   POST /api/analytics/track
// @access  Private
router.post("/track", protect, trackUserBehavior);

// @desc    Lấy sản phẩm đề xuất cho người dùng
// @route   GET /api/analytics/recommendations
// @access  Private
router.get("/recommendations", protect, getRecommendations);

// @desc    Lấy sản phẩm phổ biến
// @route   GET /api/analytics/popular
// @access  Public
router.get("/popular", getPopularProducts);

// @desc    Lấy sản phẩm liên quan
// @route   GET /api/analytics/related/:productId
// @access  Public
router.get("/related/:productId", getRelatedProducts);

module.exports = router; 