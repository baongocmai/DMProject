const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thông tin người dùng", error });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.role = req.body.role || user.role;
      user.isVerified = req.body.hasOwnProperty('isVerified') 
        ? req.body.isVerified 
        : user.isVerified;
      
      if (req.body.address) {
        user.address = {
          street: req.body.address.street || user.address?.street,
          city: req.body.address.city || user.address?.city,
          state: req.body.address.state || user.address?.state,
          zipCode: req.body.address.zipCode || user.address?.zipCode,
          country: req.body.address.country || user.address?.country || "Vietnam",
        };
      }
      
      const updatedUser = await user.save();
      
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        phone: updatedUser.phone,
        address: updatedUser.address
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật người dùng", error });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: "Không thể xóa tài khoản quản trị viên" });
      }
      
      await user.deleteOne();
      res.status(200).json({ message: "Xóa người dùng thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa người dùng", error });
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Admin
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm", error });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.status(200).json({ message: "Xóa sản phẩm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa sản phẩm", error });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng", error });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      
      if (req.body.status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      
      if (req.body.status === 'paid') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
      
      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật đơn hàng", error });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Count total users
    const userCount = await User.countDocuments();
    
    // Count total products
    const productCount = await Product.countDocuments();
    
    // Count total orders
    const orderCount = await Order.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find({ isPaid: true });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');
    
    res.status(200).json({
      userCount,
      productCount,
      orderCount,
      totalRevenue,
      recentOrders,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thống kê", error });
  }
};

// @desc    Get sales reports
// @route   GET /api/admin/reports/sales
// @access  Admin
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = { isPaid: true };
    
    if (startDate && endDate) {
      dateFilter.paidAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const salesData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } 
          },
          totalSales: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json(salesData);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo báo cáo bán hàng", error });
  }
};

// @desc    Get top selling products
// @route   GET /api/admin/reports/top-products
// @access  Admin
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.qty" },
          totalRevenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          name: "$productDetails.name",
          totalSold: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json(topProducts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm bán chạy", error });
  }
};

// @desc    Get user analytics
// @route   GET /api/admin/reports/user-analytics
// @access  Admin
exports.getUserAnalytics = async (req, res) => {
  try {
    // User registration statistics by month
    const userRegistrations = await User.aggregate([
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Most active users (by order count)
    const activeUsers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          orderCount: 1,
          totalSpent: 1
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      userRegistrations,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thông tin phân tích người dùng", error });
  }
};
