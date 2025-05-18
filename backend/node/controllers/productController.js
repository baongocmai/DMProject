const Product = require("../models/Product");
const { getHomepageRecommendations, getRelatedProductRecommendations } = require("../services/recommendationService");

// Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
  try {
    // Extract query params for filtering
    const { 
      keyword,
      category,
      minPrice,
      maxPrice, 
      rating,
      sortBy,
      limit = 10,
      page = 1
    } = req.query;

    // Build query
    const query = {};

    // Search by keyword
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Build sort object
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          sort = { price: 1 };
          break;
        case 'price-desc':
          sort = { price: -1 };
          break;
        case 'rating':
          sort = { rating: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(totalProducts / limitNum),
      total: totalProducts
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ 
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message
    });
  }
};

// Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin sản phẩm" });
  }
};

// Thêm đánh giá sản phẩm
exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // Validate input
    if (!rating || !comment) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp đánh giá và bình luận", 
        success: false 
      });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        message: "Sản phẩm không tồn tại", 
        success: false 
      });
    }

    // Check if user already reviewed this product
    if (req.user) {
      const alreadyReviewed = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({
          message: "Bạn đã đánh giá sản phẩm này rồi",
          success: false
        });
      }
    }

    // Create new review
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    // Add review to product
    product.reviews.push(review);

    // Update product rating
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    // Save product
    await product.save();

    res.status(201).json({
      message: "Đánh giá đã được thêm thành công",
      review,
      success: true
    });
  } catch (error) {
    console.error("Lỗi khi thêm đánh giá sản phẩm:", error);
    res.status(500).json({ 
      message: "Lỗi khi thêm đánh giá sản phẩm", 
      error: error.message,
      success: false 
    });
  }
};

// Lấy tất cả đánh giá của một sản phẩm
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        message: "Sản phẩm không tồn tại", 
        success: false 
      });
    }
    
    res.json({
      reviews: product.reviews,
      success: true
    });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá sản phẩm:", error);
    res.status(500).json({ 
      message: "Lỗi khi lấy đánh giá sản phẩm", 
      error: error.message,
      success: false 
    });
  }
};

// Xóa đánh giá sản phẩm (User hoặc Admin)
exports.deleteProductReview = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviewId = req.params.reviewId;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        message: "Sản phẩm không tồn tại", 
        success: false 
      });
    }
    
    // Tìm review cần xóa
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ 
        message: "Đánh giá không tồn tại", 
        success: false 
      });
    }
    
    // Kiểm tra nếu người dùng là chủ review hoặc admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Bạn không có quyền xóa đánh giá này", 
        success: false 
      });
    }
    
    // Xóa review
    review.deleteOne();
    
    // Cập nhật rating và numReviews
    if (product.reviews.length > 0) {
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    } else {
      product.rating = 0;
    }
    product.numReviews = product.reviews.length;
    
    // Lưu sản phẩm
    await product.save();
    
    res.json({
      message: "Đánh giá đã được xóa thành công",
      success: true
    });
  } catch (error) {
    console.error("Lỗi khi xóa đánh giá sản phẩm:", error);
    res.status(500).json({ 
      message: "Lỗi khi xóa đánh giá sản phẩm", 
      error: error.message,
      success: false 
    });
  }
};

// Lấy sản phẩm nổi bật cho trang chủ với đề xuất
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const userId = req.user ? req.user._id : null;

    // Lấy sản phẩm nổi bật
    const featuredProducts = await Product.find({ isFeatured: true })
      .limit(limit)
      .select('_id name price images rating numReviews description');

    // Lấy sản phẩm đề xuất cho trang chủ (cá nhân hóa nếu có userId)
    const recommendedProducts = await getHomepageRecommendations(userId, limit);

    res.json({
      featuredProducts,
      recommendedProducts,
      success: true
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ 
      message: "Lỗi khi lấy sản phẩm nổi bật",
      error: error.message,
      success: false
    });
  }
};

// Lấy sản phẩm liên quan cho trang chi tiết sản phẩm
exports.getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 4;

    const relatedProducts = await getRelatedProductRecommendations(productId, limit);

    res.json({
      relatedProducts,
      success: true
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ 
      message: "Lỗi khi lấy sản phẩm liên quan",
      error: error.message,
      success: false
    });
  }
};

// Tạo sản phẩm mới (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category, countInStock, stock, image } = req.body;
    
    // Log dữ liệu nhận được
    console.log("Dữ liệu sản phẩm nhận được:", req.body);

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!name || !price) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp ít nhất tên và giá sản phẩm",
        success: false
      });
    }

    // Sử dụng stock hoặc countInStock, ưu tiên stock nếu có
    const stockValue = stock !== undefined ? stock : (countInStock || 0);

    // Tạo sản phẩm mới
    const product = new Product({
      name,
      price,
      description: description || "",
      category: category || "Khác",
      stock: stockValue,
      image: image || ""
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const createdProduct = await product.save();
    
    console.log("Sản phẩm đã được tạo:", createdProduct);

    res.status(201).json({
      message: "Sản phẩm đã được tạo thành công",
      product: createdProduct,
      success: true
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({ 
      message: "Lỗi khi tạo sản phẩm", 
      error: error.message,
      success: false
    });
  }
};

// Cập nhật sản phẩm (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, countInStock, stock, image } = req.body;
    
    // Log dữ liệu nhận được
    console.log(`Cập nhật sản phẩm ID ${id}:`, req.body);
    
    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        message: "Không tìm thấy sản phẩm", 
        success: false 
      });
    }
    
    // Sử dụng stock hoặc countInStock, ưu tiên stock nếu có
    const stockValue = stock !== undefined ? stock : (countInStock !== undefined ? countInStock : product.stock);
    
    // Cập nhật thông tin sản phẩm
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.stock = stockValue;
    product.image = image || product.image;
    
    // Lưu sản phẩm đã cập nhật
    const updatedProduct = await product.save();
    
    console.log("Sản phẩm đã được cập nhật:", updatedProduct);
    
    res.json({
      message: "Sản phẩm đã được cập nhật thành công",
      product: updatedProduct,
      success: true
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ 
      message: "Lỗi khi cập nhật sản phẩm", 
      error: error.message,
      success: false
    });
  }
};

// Xóa sản phẩm (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Xóa sản phẩm ID ${id}`);
    
    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        message: "Không tìm thấy sản phẩm", 
        success: false 
      });
    }
    
    // Lưu thông tin sản phẩm trước khi xóa để trả về
    const deletedProductInfo = {
      id: product._id,
      name: product.name
    };
    
    // Xóa sản phẩm
    await product.deleteOne();
    
    console.log("Đã xóa sản phẩm:", deletedProductInfo);
    
    res.json({
      message: "Sản phẩm đã được xóa thành công",
      product: deletedProductInfo,
      success: true
    });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ 
      message: "Lỗi khi xóa sản phẩm", 
      error: error.message,
      success: false
    });
  }
};
