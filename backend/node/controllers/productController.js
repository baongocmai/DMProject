const Product = require("../models/Product");

// Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm" });
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
  res.send("Thêm đánh giá sản phẩm");
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
