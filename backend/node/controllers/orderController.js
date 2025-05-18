const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const GuestCart = require("../models/GuestCart");
const mongoose = require('mongoose');

// Tạo đơn hàng (hỗ trợ cả khách và người dùng đã đăng nhập)
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, guestInfo, sessionId, cartItems } = req.body;
    
    // Kiểm tra thông tin giao hàng
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ message: "Vui lòng cung cấp đủ thông tin giao hàng" });
    }

    let orderItems = [];
    let totalPrice = 0;
    let productsToUpdate = []; // Mảng lưu thông tin sản phẩm cần cập nhật số lượng

    // Tạo đơn hàng từ giỏ hàng
    if (req.user) {
      // Người dùng đã đăng nhập, lấy từ Cart
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      
      if (!cart || cart.items.length === 0) {
        // Nếu không có giỏ hàng hoặc cartItems được cung cấp trực tiếp
        if (!cartItems || cartItems.length === 0) {
          return res.status(400).json({ message: "Giỏ hàng trống, không thể tạo đơn hàng" });
        }
        // Sử dụng cartItems được cung cấp trực tiếp
        for (const item of cartItems) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(404).json({ message: `Sản phẩm ${item.productId} không tồn tại` });
          }
          
          // Kiểm tra tồn kho
          if (product.countInStock < item.quantity) {
            return res.status(400).json({ 
              message: `Sản phẩm ${product.name} chỉ còn ${product.countInStock} sản phẩm trong kho` 
            });
          }
          
          orderItems.push({
            product: product._id,
            name: product.name,
            image: product.image || 'default-image.jpg',
            price: product.price,
            qty: item.quantity
          });
          
          totalPrice += product.price * item.quantity;
          
          // Thêm vào danh sách sản phẩm cần cập nhật số lượng
          productsToUpdate.push({
            id: product._id,
            qty: item.quantity
          });
        }
      } else {
        // Sử dụng giỏ hàng từ database
        for (const item of cart.items) {
          // Kiểm tra tồn kho
          if (item.product.countInStock < item.quantity) {
            return res.status(400).json({ 
              message: `Sản phẩm ${item.product.name} chỉ còn ${item.product.countInStock} sản phẩm trong kho` 
            });
          }
          
          orderItems.push({
            product: item.product._id,
            name: item.product.name,
            image: item.product.image || 'default-image.jpg',
            price: item.product.price,
            qty: item.quantity
          });
          
          totalPrice += item.product.price * item.quantity;
          
          // Thêm vào danh sách sản phẩm cần cập nhật số lượng
          productsToUpdate.push({
            id: item.product._id,
            qty: item.quantity
          });
        }
        
        // Xóa giỏ hàng sau khi đặt hàng
        await Cart.findOneAndDelete({ user: req.user._id });
      }
    } else {
      // Khách (chưa đăng nhập)
      if (!guestInfo || !guestInfo.name || !guestInfo.email) {
        return res.status(400).json({ message: "Vui lòng cung cấp thông tin khách hàng" });
      }
      
      // Ưu tiên sử dụng giỏ hàng từ sessionId (nếu có)
      if (sessionId) {
        const guestCart = await GuestCart.findOne({ sessionId }).populate("items.product");
        
        if (guestCart && guestCart.items.length > 0) {
          for (const item of guestCart.items) {
            // Kiểm tra tồn kho
            if (item.product.countInStock < item.quantity) {
              return res.status(400).json({ 
                message: `Sản phẩm ${item.product.name} chỉ còn ${item.product.countInStock} sản phẩm trong kho` 
              });
            }
            
            orderItems.push({
              product: item.product._id,
              name: item.product.name,
              image: item.product.image || 'default-image.jpg',
              price: item.product.price,
              qty: item.quantity
            });
            
            totalPrice += item.product.price * item.quantity;
            
            // Thêm vào danh sách sản phẩm cần cập nhật số lượng
            productsToUpdate.push({
              id: item.product._id,
              qty: item.quantity
            });
          }
          
          // Xóa giỏ hàng sau khi đặt hàng
          await GuestCart.findOneAndDelete({ sessionId });
        } else if (!cartItems || cartItems.length === 0) {
          return res.status(400).json({ message: "Giỏ hàng trống, không thể tạo đơn hàng" });
        }
      }
      
      // Nếu không có giỏ hàng từ sessionId hoặc giỏ hàng trống, sử dụng cartItems
      if (orderItems.length === 0 && cartItems && cartItems.length > 0) {
        for (const item of cartItems) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(404).json({ message: `Sản phẩm ${item.productId} không tồn tại` });
          }
          
          // Kiểm tra tồn kho
          if (product.countInStock < item.quantity) {
            return res.status(400).json({ 
              message: `Sản phẩm ${product.name} chỉ còn ${product.countInStock} sản phẩm trong kho` 
            });
          }
          
          orderItems.push({
            product: product._id,
            name: product.name,
            image: product.image || 'default-image.jpg',
            price: product.price,
            qty: item.quantity
          });
          
          totalPrice += product.price * item.quantity;
          
          // Thêm vào danh sách sản phẩm cần cập nhật số lượng
          productsToUpdate.push({
            id: product._id,
            qty: item.quantity
          });
        }
      }
      
      // Nếu vẫn không có giỏ hàng
      if (orderItems.length === 0) {
        return res.status(400).json({ message: "Giỏ hàng trống, không thể tạo đơn hàng" });
      }
    }
    
    // Tạo đơn hàng mới
    const orderData = {
      orderItems,
      shippingAddress,
      totalPrice
    };
    
    // Thêm thông tin người dùng nếu đã đăng nhập
    if (req.user) {
      orderData.user = req.user._id;
    } else {
      orderData.guestInfo = guestInfo;
    }
    
    const order = new Order(orderData);
    await order.save();
    
    // Cập nhật số lượng sản phẩm trong kho
    for (const item of productsToUpdate) {
      await Product.findByIdAndUpdate(
        item.id,
        { $inc: { countInStock: -item.qty } },
        { new: true }
      );
    }
    
    res.status(201).json({
      message: "Đơn hàng đã được tạo thành công",
      order
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
  }
};

// Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra nếu đơn hàng thuộc về người dùng hiện tại hoặc là admin
    if (req.user && (req.user.isAdmin || (order.user && order.user._id.toString() === req.user._id.toString()))) {
      return res.status(200).json(order);
    } else {
      return res.status(403).json({ message: "Không có quyền truy cập đơn hàng này" });
    }
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error: error.message });
  }
};

// Lấy tất cả đơn hàng của người dùng
exports.getMyOrders = async (req, res) => {
  try {
    // Kiểm tra userId có hợp lệ không
    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const userId = req.user._id;

    // Truy vấn tất cả đơn hàng của người dùng, chỉ lấy các trường cần thiết
    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Trả về danh sách đơn hàng (ngay cả khi rỗng)
    res.status(200).json({
      message: orders.length > 0 ? "Lấy danh sách đơn hàng thành công" : "Bạn chưa có đơn hàng nào",
      orders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error: error.message });
  }
};

// Lấy danh sách tất cả đơn hàng (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting all orders:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error: error.message });
  }
};

// Lấy đơn hàng của khách (không cần đăng nhập) bằng ID và email
exports.getGuestOrder = async (req, res) => {
  try {
    const { id, email } = req.params;
    
    // Kiểm tra nếu id không phải là ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }
    
    // Tìm đơn hàng với ID và email của khách
    const order = await Order.findOne({
      _id: id,
      'guestInfo.email': email
    });
    
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng hoặc email không khớp" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng của khách:", error);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Cập nhật trạng thái đơn hàng
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái đơn hàng", error: error.message });
  }
};

