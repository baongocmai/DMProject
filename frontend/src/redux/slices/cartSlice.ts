import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem, ShippingAddress } from '../../types';
import * as api from '../../services/api';

// Import CartResponse interface from api.ts
interface CartProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  description?: string;
  category?: string;
  [key: string]: any; // Allow for additional properties
}

// Make CartResponseItem compatible with CartItem
interface CartResponseItem {
  product: CartProduct;
  quantity: number;
  [key: string]: any; // Allow for additional properties
}

interface CartResponse {
  items: CartResponseItem[];
  [key: string]: any; // Allow for additional properties
}

// Function to convert CartResponse to compatible CartItems
function normalizeCartItems(response: CartResponse): CartItem[] {
  if (!response || !response.items) return [];
  
  return response.items.map(item => ({
    product: {
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      stock: item.product.stock,
      description: item.product.description || '',
      category: item.product.category || ''
    },
    quantity: item.quantity
  }));
}

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getCart() as CartResponse;
    } catch (error: any) {
      // If cart is empty or not found, return an empty cart instead of error
      if (error.response?.status === 404) {
        return { items: [] } as CartResponse;
      }
      return rejectWithValue(error.response?.data?.message || 'Lấy giỏ hàng thất bại');
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async ({ productId, quantity }: { productId: string | undefined; quantity: number }, { rejectWithValue, dispatch, getState }) => {
    try {
      // Validate productId
      if (!productId) {
        console.error('cartSlice - Cannot add to cart: productId is undefined');
        return rejectWithValue('ID sản phẩm không hợp lệ hoặc bị thiếu');
      }
      
      // Đảm bảo quantity là số hợp lệ
      const safeQuantity = Number.isNaN(quantity) ? 1 : Math.max(1, parseInt(String(quantity), 10));
      console.log('Adding to cart - productId:', productId, 'quantity:', safeQuantity);
      
      // Thêm trạng thái loading cho sản phẩm trước khi thêm vào giỏ hàng
      dispatch(setItemLoading({ productId, isLoading: true }));
      
      // Gọi API để thêm vào giỏ hàng
      const result = await api.addToCart(productId, safeQuantity);
      
      // Xóa trạng thái loading
      dispatch(setItemLoading({ productId, isLoading: false }));
      
      // Lưu kết quả vào localStorage để đảm bảo persistence ngay cả khi refresh
      try {
        const state = getState() as { cart: CartState };
        const cartState = state.cart;
        if (cartState && cartState.cartItems && cartState.cartItems.length > 0) {
          localStorage.setItem('localCart', JSON.stringify({ 
            items: cartState.cartItems 
          }));
          console.log('Cart saved to localStorage, items:', cartState.cartItems.length);
        }
      } catch (storageError) {
        console.error('Failed to save cart to localStorage:', storageError);
      }
      
      // Kiểm tra kết quả
      if (!result || !result.items) {
        console.error('Invalid result from addToCart API:', result);
        throw new Error('Thêm vào giỏ hàng thất bại');
      }
      
      return result as CartResponse;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      
      // Xóa trạng thái loading nếu có lỗi (safe to call even if productId is undefined, as we validate it in setItemLoading)
      dispatch(setItemLoading({ productId, isLoading: false }));
      
      // Kiểm tra các loại lỗi có thể xảy ra
      let errorMessage = 'Thêm vào giỏ hàng thất bại';
      
      if (error.response) {
        // Server response with error status
        errorMessage = error.response.data?.message || errorMessage;
        console.error('Server error:', error.response.status, error.response.data);
      } else if (error.request) {
        // No response from server
        errorMessage = 'Không thể kết nối đến máy chủ';
        console.error('No response from server:', error.request);
      } else if (error.message) {
        // Other error
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (productId: string | undefined, { rejectWithValue }) => {
    try {
      // Validate productId
      if (!productId) {
        console.error('cartSlice - Cannot remove from cart: productId is undefined');
        return rejectWithValue('ID sản phẩm không hợp lệ hoặc bị thiếu');
      }
      
      await api.removeFromCart(productId);
      return productId;
    } catch (error: any) {
      console.error('cartSlice - Error removing from cart:', error);
      return rejectWithValue(error.response?.data?.message || 'Xóa sản phẩm khỏi giỏ hàng thất bại');
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }: { productId: string | undefined; quantity: number }, { rejectWithValue, getState }) => {
    try {
      // Kiểm tra productId
      if (!productId) {
        console.error('cartSlice - Cannot update cart: productId is undefined');
        return rejectWithValue('ID sản phẩm không hợp lệ hoặc bị thiếu');
      }
      
      // Đảm bảo quantity là số hợp lệ
      const safeQuantity = Number.isNaN(quantity) ? 1 : Math.max(1, parseInt(String(quantity), 10));
      console.log('cartSlice - Updating cart - productId:', productId, 'quantity:', safeQuantity);
      
      // Check against stock limits
      const state = getState() as { cart: { cartItems: CartItem[] } };
      const item = state.cart.cartItems.find(item => item.product._id === productId);
      
      if (item && item.product && typeof item.product.stock === 'number') {
        if (safeQuantity > item.product.stock) {
          console.warn('cartSlice - Quantity exceeds stock:', {
            product: item.product.name,
            requested: safeQuantity,
            available: item.product.stock
          });
          return rejectWithValue(`Số lượng không thể vượt quá ${item.product.stock} (tồn kho)`);
        }
      }
      
      // Luôn gửi yêu cầu API để đảm bảo cập nhật được lưu vào database
      const response = await api.updateCartItem(productId, safeQuantity);
      console.log('cartSlice - Update cart response:', response);
      return response as CartResponse;
    } catch (error: any) {
      console.error('cartSlice - Error updating cart:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Cập nhật giỏ hàng thất bại');
    }
  }
);

export const clearCartItems = createAsyncThunk(
  'cart/clearCartItems',
  async (_, { rejectWithValue }) => {
    try {
      await api.clearCart();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa giỏ hàng thất bại');
    }
  }
);

export const initializeCart = createAsyncThunk(
  'cart/initializeCart',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('cartSlice - Initializing cart');
      
      // Kiểm tra người dùng đã đăng nhập chưa
      const userInfoStr = localStorage.getItem('userInfo');
      let isGuest = !userInfoStr;
      
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          const token = userInfo?.token || '';
          if (!token) {
            console.log('cartSlice - User info exists but no token found');
            isGuest = true;
          }
        } catch (error) {
          console.error('cartSlice - Error parsing userInfo:', error);
          isGuest = true;
        }
      }
      
      // Lấy giỏ hàng local trước
      const localCartStr = localStorage.getItem('localCart');
      let localCart: CartResponse | null = null;
      
      if (localCartStr) {
        try {
          localCart = JSON.parse(localCartStr) as CartResponse;
          console.log('cartSlice - Found local cart with items:', localCart.items?.length || 0);
          
          // Nếu là khách không đăng nhập, sử dụng giỏ hàng local ngay lập tức
          if (isGuest) {
            console.log('cartSlice - Using local cart for guest user');
            return localCart;
          }
        } catch (error) {
          console.error('cartSlice - Error parsing local cart:', error);
          localStorage.removeItem('localCart'); // Xóa giỏ hàng không hợp lệ
        }
      } else {
        console.log('cartSlice - No local cart found');
        // Nếu không có giỏ hàng local và là khách, tạo giỏ hàng rỗng
        if (isGuest) {
          console.log('cartSlice - Creating empty cart for guest user');
          return { items: [] } as CartResponse;
        }
      }
      
      // Người dùng đã đăng nhập, thử lấy giỏ hàng từ API
      console.log('cartSlice - Fetching cart from API for logged-in user');
      try {
        const apiCart = await api.getCart();
        console.log('cartSlice - API cart fetched successfully:', apiCart);
        
        // Merge giỏ hàng local vào giỏ hàng API nếu cần
        if (localCart && localCart.items && localCart.items.length > 0 && (!apiCart.items || apiCart.items.length === 0)) {
          console.log('cartSlice - Merging local cart into empty API cart');
          
          // Chuyển đổi từ format local sang format API
          const promises = localCart.items.map(async (item) => {
            try {
              await api.addToCart(item.product._id, item.quantity);
            } catch (err) {
              console.error('cartSlice - Error adding local item to API cart:', err);
            }
          });
          
          await Promise.allSettled(promises);
          
          // Lấy lại giỏ hàng từ API sau khi merge
          const updatedApiCart = await api.getCart();
          console.log('cartSlice - Cart updated after merge:', updatedApiCart);
          return updatedApiCart;
        }
        
        return apiCart;
      } catch (apiError) {
        console.error('cartSlice - Error fetching cart from API:', apiError);
        
        // Nếu API thất bại, dùng giỏ hàng local làm fallback
        if (localCart) {
          console.log('cartSlice - Using local cart as fallback after API error');
          return localCart;
        }
        
        // Không có giỏ hàng local và API lỗi, trả về giỏ hàng rỗng
        return { items: [] } as CartResponse;
      }
    } catch (error: any) {
      console.error('cartSlice - Error in initializeCart:', error);
      return rejectWithValue(error.message || 'Khởi tạo giỏ hàng thất bại');
    }
  }
);

interface CartState {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress | null;
  paymentMethod: string;
  loading: boolean;
  loadingItems: Record<string, boolean>; // Map productId -> loading status
  error: string | null;
}

const initialState: CartState = {
  cartItems: [],
  shippingAddress: null,
  paymentMethod: 'cod',
  loading: false,
  loadingItems: {},
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      // Xóa giỏ hàng local khi clear
      localStorage.removeItem('localCart');
    },
    clearError: (state) => {
      state.error = null;
    },
    saveShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.shippingAddress = action.payload;
      // Save to localStorage for persistence
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
      // Save to localStorage for persistence
      localStorage.setItem('paymentMethod', action.payload);
    },
    updateQuantityLocally: (state, action: PayloadAction<{productId: string | undefined; quantity: number}>) => {
      const { productId, quantity } = action.payload;
      
      // Validate productId
      if (!productId) {
        console.error('cartSlice - updateQuantityLocally: productId is undefined');
        return; // Exit early if productId is invalid
      }
      
      // Đảm bảo quantity là số hợp lệ, dùng isNaN thay vì Number.isNaN để bắt được cả string
      const safeQuantity = isNaN(quantity) ? 1 : Math.max(1, Math.round(Number(quantity)));
      
      console.log('cartSlice - updateQuantityLocally:', { productId, originalQuantity: quantity, safeQuantity });
      
      const itemIndex = state.cartItems.findIndex(item => item.product._id === productId);
      if (itemIndex !== -1) {
        // Check stock limits
        const item = state.cartItems[itemIndex];
        if (item.product && typeof item.product.stock === 'number') {
          if (safeQuantity > item.product.stock) {
            console.warn('cartSlice - updateQuantityLocally: quantity exceeds stock', {
              product: item.product.name,
              requested: safeQuantity,
              available: item.product.stock
            });
            // Limit quantity to stock amount
            state.cartItems[itemIndex].quantity = item.product.stock;
          } else {
            // Update with valid quantity
            state.cartItems[itemIndex].quantity = safeQuantity;
          }
        } else {
          // Stock information not available, just update
          state.cartItems[itemIndex].quantity = safeQuantity;
        }
        
        // Đảm bảo thông tin giá là số hợp lệ
        if (state.cartItems[itemIndex].product && state.cartItems[itemIndex].product.price) {
          const price = state.cartItems[itemIndex].product.price;
          if (isNaN(Number(price))) {
            console.warn('cartSlice - Invalid price detected:', price);
            // Xử lý trường hợp giá không phải số
            state.cartItems[itemIndex].product.price = Number(price) || 0;
          }
        }
        
        // Cập nhật localStorage khi thay đổi số lượng locally
        try {
          const localCart = localStorage.getItem('localCart');
          if (localCart) {
            const parsedCart = JSON.parse(localCart);
            if (parsedCart && parsedCart.items) {
              const localItemIndex = parsedCart.items.findIndex((item: any) => 
                item.product._id === productId);
              
              if (localItemIndex !== -1) {
                // Use the same stock-limited quantity that was set in state
                parsedCart.items[localItemIndex].quantity = state.cartItems[itemIndex].quantity;
                localStorage.setItem('localCart', JSON.stringify(parsedCart));
              }
            }
          }
        } catch (error) {
          console.error('Error updating local cart:', error);
        }
        
        console.log('cartSlice - Item after updateQuantityLocally:', state.cartItems[itemIndex]);
      } else {
        console.warn('cartSlice - Product not found in cart:', productId);
      }
    },
    setItemLoading: (state, action: PayloadAction<{productId: string | undefined; isLoading: boolean}>) => {
      const { productId, isLoading } = action.payload;
      
      // Validate productId
      if (!productId) {
        console.error('cartSlice - setItemLoading: productId is undefined');
        return; // Exit early if productId is invalid
      }
      
      state.loadingItems[productId] = isLoading;
    },
    mergeCarts: (state) => {
      // Hàm này để merge giỏ hàng local và giỏ hàng từ API sau khi đăng nhập
      try {
        const localCart = localStorage.getItem('localCart');
        if (localCart) {
          const parsedCart = JSON.parse(localCart);
          if (parsedCart && parsedCart.items && parsedCart.items.length > 0) {
            // Merge items từ local cart vào state
            parsedCart.items.forEach((localItem: any) => {
              const existingItemIndex = state.cartItems.findIndex(
                item => item.product._id === localItem.product._id
              );
              
              if (existingItemIndex !== -1) {
                // Nếu sản phẩm đã có trong giỏ hàng API, cộng thêm số lượng
                state.cartItems[existingItemIndex].quantity += localItem.quantity;
              } else {
                // Nếu sản phẩm chưa có trong giỏ hàng API, thêm mới
                state.cartItems.push(localItem);
              }
            });
            
            // Xóa giỏ hàng local sau khi đã merge
            localStorage.removeItem('localCart');
          }
        }
      } catch (error) {
        console.error('Error merging carts:', error);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.loading = false;
        state.cartItems = normalizeCartItems(action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Initialize cart
      .addCase(initializeCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeCart.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.loading = false;
        state.cartItems = normalizeCartItems(action.payload);
      })
      .addCase(initializeCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add item to cart
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.loading = false;
        state.cartItems = normalizeCartItems(action.payload);
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove item from cart
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.cartItems = state.cartItems.filter(
          (item) => item.product._id !== action.payload
        );
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update cart item quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        // Không set loading cho cả trang, để không làm flicker UI
        // state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        // Cập nhật state mà không đặt loading = false để không flicker UI
        // state.loading = false;
        state.cartItems = normalizeCartItems(action.payload);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        // state.loading = false;
        state.error = action.payload as string;
      })
      // Clear cart
      .addCase(clearCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartItems.fulfilled, (state) => {
        state.loading = false;
        state.cartItems = [];
      })
      .addCase(clearCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCart, clearError, saveShippingAddress, savePaymentMethod, updateQuantityLocally, setItemLoading, mergeCarts } = cartSlice.actions;
export default cartSlice.reducer; 