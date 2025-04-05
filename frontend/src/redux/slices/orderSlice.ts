import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../services/api';
import { ShippingAddress } from '../../types';
import { clearCart } from './cartSlice';

// Interfaces
export interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  user?: string;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  order?: any; // Hỗ trợ định dạng response { message, order }
}

export interface OrderPayload {
  orderItems?: {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  cartItems?: { productId: string, quantity: number }[];
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  totalPrice?: number;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  qty?: number; // Thêm trường qty để phù hợp với backend
}

// Interface for order creation
interface OrderCreateData {
  orderItems: {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

// Async thunks
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData: OrderPayload, { dispatch, rejectWithValue }) => {
    try {
      console.log('OrderSlice - Creating order with data:', orderData);
      
      // Chuẩn bị dữ liệu đơn hàng theo format mới
      const formattedOrderData: any = {
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'cod',
      };
      
      // Thêm orderItems hoặc cartItems tùy theo dữ liệu đầu vào
      if (orderData.orderItems && orderData.orderItems.length > 0) {
        formattedOrderData.orderItems = orderData.orderItems.map(item => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.quantity
        }));
      } else if (orderData.cartItems && orderData.cartItems.length > 0) {
        formattedOrderData.cartItems = orderData.cartItems;
      }
      
      // Thêm thông tin khách nếu có
      if (orderData.guestInfo) {
        formattedOrderData.guestInfo = orderData.guestInfo;
      }
      
      // Thêm totalPrice nếu có
      if (orderData.totalPrice) {
        formattedOrderData.totalPrice = orderData.totalPrice;
      }
      
      console.log('OrderSlice - Formatted order data for backend:', formattedOrderData);
      
      // Gọi API và lấy kết quả
      const result = await api.createOrder(formattedOrderData);
      console.log('OrderSlice - Order created successfully:', result);
      
      // Xóa giỏ hàng sau khi đặt hàng thành công
      dispatch(clearCart());
      
      return result;
    } catch (error: any) {
      console.error('OrderSlice - Error creating order:', error);
      
      // Kiểm tra lỗi và trả về message phù hợp
      let errorMessage = 'Lỗi tạo đơn hàng';
      
      if (error.response) {
        // Lỗi từ response backend
        errorMessage = error.response.data?.message || errorMessage;
        console.error('OrderSlice - Backend error:', error.response.status, error.response.data);
        
        // Kiểm tra status code
        if (error.response.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
        } else if (error.response.status === 404) {
          errorMessage = 'Không tìm thấy API tạo đơn hàng, kiểm tra lại kết nối backend';
        }
      } else if (error.request) {
        // Không nhận được response từ backend
        errorMessage = 'Không thể kết nối đến máy chủ';
        console.error('OrderSlice - No response from server:', error.request);
      } else if (error.message) {
        // Lỗi khi thiết lập request
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  'order/getOrderDetails',
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await api.getOrderById(orderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin đơn hàng thất bại');
    }
  }
);

// Add missing payOrder function to API service
// For now, we'll use updateOrderStatus as a fallback
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      // This is a temporary solution until the API is updated
      return await api.updateOrderStatus(orderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật thanh toán thất bại');
    }
  }
);

// Add missing deliverOrder function to API service
// For now, we'll use updateOrderStatus as a fallback
export const deliverOrder = createAsyncThunk(
  'order/deliverOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      // This is a temporary solution until the API is updated
      return await api.updateOrderStatus(orderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật giao hàng thất bại');
    }
  }
);

export const getUserOrders = createAsyncThunk(
  'order/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      // Fix: use getMyOrders instead of getUserOrders
      return await api.getMyOrders();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách đơn hàng thất bại');
    }
  }
);

// Order state interface
interface OrderState {
  order: Order | null;
  orders: Order[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  orders: [],
  loading: false,
  success: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.success = false;
      state.error = null;
    },
    clearOrderDetails: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.success = true;
        // Xử lý trường hợp fake order có format khác
        if (action.payload && 'order' in action.payload) {
          // Nếu response có dạng { message, order }
          state.order = action.payload.order as unknown as Order;
        } else {
          // Format thông thường
          state.order = action.payload;
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get order details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        
        // Nếu thất bại, kiểm tra xem đây có phải là fake order không
        const errorMessage = action.payload as string;
        if (errorMessage && errorMessage.includes('find')) {
          const fakeOrderId = action.meta.arg;
          if (fakeOrderId && fakeOrderId.startsWith('fake_order_')) {
            console.log('Thử tìm fake order trong localStorage:', fakeOrderId);
            try {
              const fakeOrderData = localStorage.getItem(`fakeOrder_${fakeOrderId}`);
              if (fakeOrderData) {
                const parsedOrder = JSON.parse(fakeOrderData);
                console.log('Đã tìm thấy fake order trong localStorage:', parsedOrder);
                state.order = parsedOrder as Order;
                state.error = null;
              }
            } catch (err) {
              console.error('Failed to retrieve fake order from localStorage:', err);
            }
          }
        }
      })
      // Pay order
      .addCase(payOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Deliver order
      .addCase(deliverOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deliverOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOrderState, clearOrderDetails } = orderSlice.actions;
export default orderSlice.reducer; 