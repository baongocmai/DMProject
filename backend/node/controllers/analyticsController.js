const UserBehavior = require("../models/UserBehavior");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Track user behavior
// @route   POST /api/analytics/track
// @access  Private
exports.trackUserBehavior = asyncHandler(async (req, res) => {
  try {
    const { type, productId, searchQuery, metadata } = req.body;
    const userId = req.user._id;
    
    if (!type) {
      return res.status(400).json({ message: "Loại hành vi không được để trống" });
    }
    
    let result;
    
    switch (type) {
      case 'view':
        if (!productId) {
          return res.status(400).json({ message: "ID sản phẩm không được để trống" });
        }
        result = await UserBehavior.trackProductView(userId, productId, metadata);
        break;
        
      case 'search':
        if (!searchQuery) {
          return res.status(400).json({ message: "Từ khóa tìm kiếm không được để trống" });
        }
        result = await UserBehavior.trackSearch(userId, searchQuery, metadata);
        break;
        
      case 'cart':
        if (!productId) {
          return res.status(400).json({ message: "ID sản phẩm không được để trống" });
        }
        result = await UserBehavior.trackAddToCart(userId, productId, metadata);
        break;
        
      case 'purchase':
        if (!productId) {
          return res.status(400).json({ message: "ID sản phẩm không được để trống" });
        }
        result = await UserBehavior.trackPurchase(userId, productId, metadata);
        break;
        
      default:
        return res.status(400).json({ message: "Loại hành vi không hợp lệ" });
    }
    
    res.status(200).json({ message: "Ghi nhận hành vi thành công" });
  } catch (error) {
    console.error("Error tracking user behavior:", error);
    res.status(500).json({ message: "Lỗi ghi nhận hành vi người dùng", error });
  }
});

// @desc    Get product recommendations for user
// @route   GET /api/analytics/recommendations
// @access  Private
exports.getRecommendations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get product IDs recommended for this user
    const recommendedProductIds = await UserBehavior.getUserRecommendations(userId);
    
    if (!recommendedProductIds || recommendedProductIds.length === 0) {
      // If no personalized recommendations, return popular products
      const popularProducts = await Product.find({})
        .sort({ rating: -1 })
        .limit(10);
        
      return res.status(200).json(popularProducts);
    }
    
    // Fetch full product details
    const recommendedProducts = await Product.find({
      _id: { $in: recommendedProductIds }
    });
    
    res.status(200).json(recommendedProducts);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ message: "Lỗi lấy sản phẩm đề xuất", error });
  }
});

// @desc    Get popular products
// @route   GET /api/analytics/popular
// @access  Public
exports.getPopularProducts = asyncHandler(async (req, res) => {
  try {
    // Get most viewed products from user behavior data
    const popularProductIds = await UserBehavior.aggregate([
      { $unwind: "$behaviors" },
      { $match: { "behaviors.type": "view" } },
      { $group: {
          _id: "$behaviors.product",
          viewCount: { $sum: 1 }
        }
      },
      { $sort: { viewCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Extract just the product IDs
    const productIds = popularProductIds.map(item => item._id);
    
    // Fetch the actual products
    const popularProducts = await Product.find({
      _id: { $in: productIds }
    });
    
    // Sort products in the same order as the view counts
    const sortedProducts = productIds.map(id => 
      popularProducts.find(product => product._id.toString() === id.toString())
    ).filter(product => product); // Remove any null/undefined values
    
    res.status(200).json(sortedProducts);
  } catch (error) {
    console.error("Error getting popular products:", error);
    
    // Fallback to simple product sorting if aggregation fails
    try {
      const products = await Product.find({})
        .sort({ rating: -1 })
        .limit(10);
        
      res.status(200).json(products);
    } catch (fallbackError) {
      res.status(500).json({ message: "Lỗi lấy sản phẩm phổ biến", error });
    }
  }
});

// @desc    Get related products
// @route   GET /api/analytics/related/:productId
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get the current product to find its category
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    
    // Find products frequently viewed together with this product
    const relatedFromBehavior = await UserBehavior.aggregate([
      { $unwind: "$behaviors" },
      { $match: { "behaviors.product": mongoose.Types.ObjectId(productId) } },
      { $group: { _id: "$user" } },
      { $lookup: {
          from: "userbehaviors",
          localField: "_id",
          foreignField: "user",
          as: "userBehaviors"
        }
      },
      { $unwind: "$userBehaviors" },
      { $unwind: "$userBehaviors.behaviors" },
      { $match: { 
          "userBehaviors.behaviors.product": { $ne: mongoose.Types.ObjectId(productId) },
          "userBehaviors.behaviors.type": { $in: ["view", "purchase"] }
        }
      },
      { $group: {
          _id: "$userBehaviors.behaviors.product",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Extract product IDs
    const relatedProductIds = relatedFromBehavior.map(item => item._id);
    
    // If we have enough related products from behavior, use those
    if (relatedProductIds.length >= 4) {
      const relatedProducts = await Product.find({
        _id: { $in: relatedProductIds }
      });
      
      return res.status(200).json(relatedProducts);
    }
    
    // Otherwise, fall back to category-based recommendations
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      category: product.category
    }).limit(5);
    
    res.status(200).json(relatedProducts);
  } catch (error) {
    console.error("Error getting related products:", error);
    res.status(500).json({ message: "Lỗi lấy sản phẩm liên quan", error });
  }
}); 