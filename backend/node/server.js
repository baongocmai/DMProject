const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const setupSwagger = require("./swagger");
require("dotenv").config();

const app = express();

// Enable CORS - Cho phép tất cả các nguồn truy cập API
app.use(cors({
  origin: '*', // Cho phép tất cả các nguồn truy cập
  credentials: true
}));

app.use(express.json());

// Kết nối MongoDB
connectDB();

// Setup Swagger documentation
setupSwagger(app);

// Log tất cả các requests để debug
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  // Log thêm chi tiết headers cho việc debug
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Route kiểm tra API đang hoạt động
app.get("/", (req, res) => res.send("API is running"));
app.get("/api", (req, res) => res.send("API is running"));

// Add status endpoint for health checks
app.get("/api/status", (req, res) => {
  res.json({ 
    status: "success", 
    message: "API server is running", 
    timestamp: new Date().toISOString() 
  });
});

// Routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const recommendRoutes = require("./routes/recommendRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const couponRoutes = require("./routes/couponRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const metricsRoutes = require("./routes/metricsRoutes");

// Áp dụng routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/metrics", metricsRoutes);

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy đường dẫn" });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Lỗi máy chủ",
    error: process.env.NODE_ENV === "production" ? {} : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


