// const express = require("express");
// const { getProducts, createProduct, deleteProduct } = require("../controllers/productController");
// const router = express.Router();

// router.get("/", getProducts);
// router.post("/", createProduct);
// router.delete("/:id", deleteProduct);

// module.exports = router;

const express = require("express");
const {
  getProducts,
  getProductById,
  addProductReview,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController"); // Đảm bảo đường dẫn đúng

const { protect, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route lấy danh sách sản phẩm
router.get("/", getProducts);

// Route lấy chi tiết sản phẩm
router.get("/:id", getProductById);

// Route thêm đánh giá sản phẩm
router.post("/:id/review", protect, addProductReview);

// Route thêm sản phẩm mới (Admin)
router.post("/", protect, isAdmin, createProduct);

// Route thêm sản phẩm mới không cần xác thực (chỉ dùng để test)
// CẢNH BÁO: Chỉ dùng trong môi trường phát triển, không dùng trong môi trường thực tế!
router.post("/test-create", createProduct);

// Route cập nhật sản phẩm (Admin)
router.put("/:id", protect, isAdmin, updateProduct);

// Route cập nhật sản phẩm không cần xác thực (chỉ dùng để test)
// CẢNH BÁO: Chỉ dùng trong môi trường phát triển, không dùng trong môi trường thực tế!
router.put("/test-update/:id", updateProduct);

// Route xóa sản phẩm (Admin)
router.delete("/:id", protect, isAdmin, deleteProduct);

// Route xóa sản phẩm không cần xác thực (chỉ dùng để test)
// CẢNH BÁO: Chỉ dùng trong môi trường phát triển, không dùng trong môi trường thực tế!
router.delete("/test-delete/:id", deleteProduct);

module.exports = router;
