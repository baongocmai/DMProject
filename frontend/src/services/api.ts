import axios from 'axios';
import { 
  LoginCredentials, 
  RegisterData, 
  OtpVerification, 
  PasswordReset,
  Product,
  Order,
  ShippingAddress
} from '../types';

// Thử các API URL khác nhau - thêm localhost không có port để thử
const POSSIBLE_API_URLS = [
  'http://localhost:5000/api',
  'http://localhost:5000',
  'http://127.0.0.1:5000/api',
  'http://127.0.0.1:5000',
  'http://localhost:3001/api',
  'http://localhost:3001',
  '/api'  // Relative URL nếu backend và frontend chung server
];

// Đảm bảo kết nối với backend thật
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Chọn API URL đầu tiên làm mặc định
const API_URL = POSSIBLE_API_URLS[0];
console.log('API configuration - Default API URL:', API_URL);

// Danh sách các API URL để thử
console.log('Will try these API URLs if default fails:', POSSIBLE_API_URLS.slice(1));

// Create axios instance
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Vô hiệu hóa cookies để tránh vấn đề CORS
  timeout: 15000, // 15 second timeout
});

// Add request interceptor to handle potential CORS issues
api.interceptors.request.use(
  (config) => {
    // Log outgoing requests for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo.token) {
          config.headers.Authorization = `Bearer ${userInfo.token}`;
          console.log('API - Added auth token to request:', config.url);
        }
      } catch (error) {
        console.error('Error parsing userInfo from localStorage:', error);
        localStorage.removeItem('userInfo'); // Remove invalid data
      }
    }
    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error('API Response error:', error);
    
    // Handle CORS errors
    if (error.message === 'Network Error') {
      console.error('Possible CORS issue - Network Error');
    }
    
    // Handle specific HTTP errors
    if (error.response) {
      console.error(`API Error ${error.response.status} for ${error.config.url}:`, error.response.data);
      
      switch (error.response.status) {
        case 401:
          console.log('Unauthorized - User session may have expired');
          // Could redirect to login or dispatch logout action here
          break;
        case 403:
          console.log('Forbidden - User does not have permission');
          break;
        case 404:
          console.log('Resource not found:', error.config.url);
          break;
        case 500:
          console.log('Server error:', error.config.url);
          break;
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.log('Network error - no response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.log('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Thêm utility function để thử lại request nếu thất bại
const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`API - Attempt ${attempt + 1}/${maxRetries}`);
      const result = await requestFn();
      return result;
    } catch (error: any) {
      console.warn(`API - Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      // Chỉ thử lại nếu là lỗi mạng hoặc timeout
      if (error.message !== 'Network Error' && error.code !== 'ECONNABORTED') {
        throw error; // Không thử lại nếu lỗi không phải do mạng
      }
      
      // Đợi trước khi thử lại
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, attempt); // Exponential backoff
        console.log(`API - Waiting ${waitTime}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // Nếu tất cả các lần thử đều thất bại, throw lỗi cuối cùng
  throw lastError;
};

// Auth API calls
export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/api/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (userData: RegisterData) => {
  try {
    const response = await api.post('/api/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const verifyOTP = async (verificationData: OtpVerification) => {
  try {
    // Ensure the OTP is properly formatted
    const formattedData = {
      userId: verificationData.userId.trim(),
      otp: verificationData.otp.trim().slice(0, 6).padStart(6, '0')
    };
    
    console.log('API - Sending OTP verification request:', formattedData);
    const response = await api.post('/api/users/verify-otp', formattedData);
    console.log('API - OTP verification response:', response.data);
    
    if (response.data && response.data.token) {
      console.log('API - Verification successful, token received');
      return response.data;
    } else {
      console.warn('API - Verification response missing token:', response.data);
      return response.data;
    }
  } catch (error: any) {
    console.error('API - OTP verification error:', error.response?.data || error.message);
    
    // Add detailed error message for debugging
    if (error.response) {
      console.error('API - Error status:', error.response.status);
      console.error('API - Error headers:', error.response.headers);
      console.error('API - Error data:', error.response.data);
      
      if (error.response.status === 400) {
        console.error('API - Bad Request details:', JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.error('API - No response received:', error.request);
    } else {
      console.error('API - Error setting up request:', error.message);
    }
    
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/users/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (resetData: PasswordReset) => {
  const response = await api.post('/users/reset-password', resetData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (userData: Partial<RegisterData>) => {
  try {
    // Clone userData to avoid mutation
    const formattedData = { ...userData };
    
    // Clean up data before sending
    Object.keys(formattedData).forEach(key => {
      if (typeof formattedData[key as keyof typeof formattedData] === 'string') {
        formattedData[key as keyof typeof formattedData] = 
          (formattedData[key as keyof typeof formattedData] as string).trim();
      }
      
      // Remove empty strings
      if (formattedData[key as keyof typeof formattedData] === '') {
        delete formattedData[key as keyof typeof formattedData];
      }
    });
    
    console.log('API - Sending update profile request with formatted data:', formattedData);
    
    const response = await api.put('/api/users/update-profile', formattedData);
    console.log('API - Update profile response:', response.data);
    
    // If we have a successful response with token, update localStorage
    if (response.data) {
      console.log('API - Profile update successful, updating localStorage');
      // Get the current userInfo
      const currentUserInfo = localStorage.getItem('userInfo');
      if (currentUserInfo) {
        try {
          // Parse current user info
          const parsedInfo = JSON.parse(currentUserInfo);
          // Update with new data but keep existing fields that weren't changed
          const updatedInfo = { ...parsedInfo, ...response.data };
          console.log('API - Updated user info to save:', updatedInfo);
          // Save back to localStorage
          localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
        } catch (err) {
          console.error('Error updating localStorage with new profile data:', err);
        }
      } else {
        // Just store the response if no current data
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API - Profile update error:', error.response?.data || error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('API - Error status:', error.response.status);
      console.error('API - Error headers:', error.response.headers);
      console.error('API - Error data:', error.response.data);
      
      if (error.response.status === 400) {
        console.error('API - Bad Request details:', JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.error('API - No response received:', error.request);
    } else {
      console.error('API - Error setting up request:', error.message);
    }
    
    throw error;
  }
};

// Thêm hàm riêng để debug trực tiếp endpoint products
export const debugProductsEndpoint = async () => {
  try {
    console.log('API - Testing connection to all possible endpoints');
    
    // Kiểm tra tất cả các base URL có thể
    for (const baseUrl of POSSIBLE_API_URLS) {
      // Kiểm tra endpoint root 
      try {
        console.log(`Testing root endpoint at: ${baseUrl}`);
        const rootResponse = await fetch(`${baseUrl}`);
        if (rootResponse.ok) {
          console.log(`API root endpoint working at: ${baseUrl}`);
          // Thử endpoint products
          const productsResponse = await fetch(`${baseUrl}/products`);
          if (productsResponse.ok) {
            console.log(`Products endpoint working at: ${baseUrl}/products`);
            const data = await productsResponse.json();
            if (data && (Array.isArray(data) || data.products)) {
              console.log(`Found products at ${baseUrl}/products:`, 
                Array.isArray(data) ? data.length : data.products.length, 'items');
              return { 
                success: true, 
                url: `${baseUrl}/products`, 
                data: Array.isArray(data) ? data : data.products 
              };
            }
          }
          
          // Thử endpoint api/products
          const apiProductsResponse = await fetch(`${baseUrl}/api/products`);
          if (apiProductsResponse.ok) {
            console.log(`Products endpoint working at: ${baseUrl}/api/products`);
            const data = await apiProductsResponse.json();
            if (data && (Array.isArray(data) || data.products)) {
              console.log(`Found products at ${baseUrl}/api/products:`, 
                Array.isArray(data) ? data.length : data.products.length, 'items');
              return { 
                success: true, 
                url: `${baseUrl}/api/products`, 
                data: Array.isArray(data) ? data : data.products 
              };
            }
          }
        }
      } catch (err) {
        console.log(`API at ${baseUrl} is not responding:`, err);
      }
    }
    
    // Nếu không tìm thấy API nào hoạt động, trả về mock data
    console.log('All API endpoints failed, using mock products data');
    return { success: true, url: 'mock', data: getMockProducts() };
    
  } catch (err: any) {
    console.error('Debug products endpoint failed:', err.message);
    return { success: false, error: err.message };
  }
};

// Product API calls
export const getProducts = async () => {
  try {
    console.log('API - Fetching all products from database');
    
    // Thử debug endpoint trước
    const debugResult = await debugProductsEndpoint();
    if (debugResult.success && debugResult.data) {
      console.log('Using successful debug data');
      return debugResult.data;
    }
    
    // Nếu debug không thành công, tiếp tục với cách thông thường
    const response = await api.get('/products');
    console.log('API - Raw response:', response);
    
    if (response.data) {
      // Nếu response.data là một mảng
      if (Array.isArray(response.data)) {
        console.log('API - Products received as array, count:', response.data.length);
        return response.data;
      } 
      // Nếu response.data có trường products
      else if (response.data.products && Array.isArray(response.data.products)) {
        console.log('API - Products received in products field, count:', response.data.products.length);
        return response.data.products;
      }
      // Nếu response.data có dạng khác nhưng có thể chứa products
      else {
        console.log('API - Response structure:', Object.keys(response.data));
        // Kiểm tra các trường có thể chứa sản phẩm
        for (const key of Object.keys(response.data)) {
          if (Array.isArray(response.data[key])) {
            console.log(`API - Products may be in field "${key}", count:`, response.data[key].length);
            return response.data[key];
          }
        }
      }
    }
    
    console.warn('API - No products found in response');
    return [];
  } catch (error: any) {
    console.error('API - Error fetching products:', error.response?.data || error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('API - Error status:', error.response.status);
      console.error('API - Error headers:', error.response.headers);
      console.error('API - Error data:', error.response.data);
    } else if (error.request) {
      console.error('API - No response received:', error.request);
    } else {
      console.error('API - Error setting up request:', error.message);
    }
    
    // Trả về mảng rỗng nếu có lỗi
    return [];
  }
};

// Helper function to get mock products when API fails
function getMockProducts() {
  return [
    {
      _id: 'mock1',
      name: 'Laptop Gaming Acer Nitro 5',
      price: 22990000,
      description: 'Laptop gaming mạnh mẽ với card đồ họa RTX 3060',
      category: 'Laptop',
      stock: 10,
      image: 'https://placehold.co/600x400?text=Laptop'
    },
    {
      _id: 'mock2',
      name: 'Điện thoại Samsung Galaxy S23',
      price: 18990000,
      description: 'Điện thoại flagship với camera 108MP',
      category: 'Điện thoại',
      stock: 15,
      image: 'https://placehold.co/600x400?text=Phone'
    },
    {
      _id: 'mock3',
      name: 'Tai nghe Apple AirPods Pro',
      price: 5990000,
      description: 'Tai nghe không dây với chống ồn chủ động',
      category: 'Tai nghe',
      stock: 20,
      image: 'https://placehold.co/600x400?text=Headphones'
    },
    {
      _id: 'mock4',
      name: 'Màn hình Dell Ultrasharp 27"',
      price: 8990000, 
      description: 'Màn hình 4K với độ phủ màu 99% sRGB',
      category: 'Màn hình',
      stock: 8,
      image: 'https://placehold.co/600x400?text=Monitor'
    },
    {
      _id: 'mock5',
      name: 'Bàn phím cơ Logitech G Pro X',
      price: 2990000,
      description: 'Bàn phím cơ với switch GX Blue có thể thay thế',
      category: 'Bàn phím',
      stock: 12,
      image: 'https://placehold.co/600x400?text=Keyboard'
    },
    {
      _id: 'mock6',
      name: 'Chuột gaming Razer DeathAdder V2',
      price: 1490000,
      description: 'Chuột gaming với cảm biến 20.000 DPI',
      category: 'Chuột',
      stock: 18,
      image: 'https://placehold.co/600x400?text=Mouse'
    }
  ];
}

export const getProductById = async (id: string) => {
  try {
    console.log(`API - Fetching product with ID: ${id}`);
    const response = await api.get(`/api/products/${id}`);
    console.log('API - Product details response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`API - Error fetching product ${id}:`, error.response?.data || error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('API - Error status:', error.response.status);
      console.error('API - Error headers:', error.response.headers);
      console.error('API - Error data:', error.response.data);
    } else if (error.request) {
      console.error('API - No response received:', error.request);
    } else {
      console.error('API - Error setting up request:', error.message);
    }
    
    throw error;
  }
};

// Cart API calls
export const getCart = async () => {
  const response = await api.get('/api/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number) => {
  try {
    console.log('API - Adding to cart:', { productId, quantity });
    
    // Đảm bảo dữ liệu gửi đi hợp lệ
    if (!productId) {
      console.error('API - Invalid productId for cart addition');
      throw new Error('Thiếu ID sản phẩm');
    }
    
    // Đảm bảo số lượng hợp lệ và không phải NaN
    const safeQuantity = isNaN(quantity) ? 1 : Math.max(1, Math.round(quantity));
    console.log('API - Safe quantity for cart addition:', safeQuantity);
    
    // Kiểm tra nếu người dùng đã đăng nhập
    const userInfoStr = localStorage.getItem('userInfo');
    let token = '';
    let isGuest = !userInfoStr;
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        token = userInfo?.token || '';
        if (token) {
          console.log('API - User is logged in with token');
        } else {
          console.log('API - User info exists but no token found');
          isGuest = true;
        }
      } catch (error) {
        console.error('API - Error parsing userInfo:', error);
        isGuest = true;
      }
    } else {
      console.log('API - No user logged in, will create local cart');
      isGuest = true;
    }
    
    // Nếu là khách không đăng nhập, tạo giỏ hàng local ngay lập tức
    if (isGuest) {
      console.log('API - Using local cart for guest user');
      return createLocalCartItem(productId, safeQuantity);
    }
    
    // Người dùng đã đăng nhập, thử với axios trước
    try {
      console.log('API - Attempting to add to cart with axios');
      const response = await api.post('/api/cart/add', { productId, quantity: safeQuantity });
      console.log('API - Successfully added to cart using axios:', response.data);
      return response.data;
    } catch (axiosError: any) {
      console.warn('API - Axios failed for cart addition:', axiosError.message);
      
      // Thử với fetch API
      if (token) {
        try {
          console.log('API - Attempting to add to cart with fetch and token');
          const fetchResponse = await fetch(`${apiUrl}/api/cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: safeQuantity })
          });
          
          if (fetchResponse.ok) {
            const data = await fetchResponse.json();
            console.log('API - Successfully added to cart using fetch:', data);
            return data;
          } else {
            console.warn(`API - Fetch failed with status: ${fetchResponse.status}`);
            // Nếu server trả về 401 (Unauthorized), có thể token đã hết hạn
            if (fetchResponse.status === 401) {
              console.warn('API - User authentication failed (401), using local cart');
              return createLocalCartItem(productId, safeQuantity);
            }
          }
        } catch (fetchError) {
          console.warn('API - Fetch API failed:', fetchError);
        }
      }
      
      // Nếu cả hai đều thất bại, tạo giỏ hàng local
      console.log('API - Both axios and fetch failed, creating local cart item');
      return createLocalCartItem(productId, safeQuantity);
    }
  } catch (error: any) {
    console.error('API - Error adding to cart:', error.message);
    // Nếu có lỗi, trả về giỏ hàng local
    return createLocalCartItem(productId, quantity);
  }
};

// Tạo giỏ hàng local nếu API không hoạt động
async function createLocalCartItem(productId: string, quantity: number) {
  try {
    console.log('API - Creating local cart item for product:', productId);
    
    // Lấy thông tin sản phẩm - thử lấy chi tiết sản phẩm
    let product;
    try {
      product = await getProductById(productId);
      console.log('API - Retrieved product details for local cart:', product);
    } catch (error) {
      console.warn('API - Failed to get product details for local cart:', error);
      // Nếu không lấy được thông tin sản phẩm, sử dụng dữ liệu mẫu
      product = {
        _id: productId,
        name: 'Sản phẩm tạm thời',
        price: 0,
        image: 'placeholder-image',
        description: 'Đang tải thông tin sản phẩm...',
        stock: 10
      };
      console.log('API - Using placeholder product for local cart');
    }
    
    // Định nghĩa interface cho cart item
    interface LocalCartItem {
      product: any;
      quantity: number;
    }
    
    // Lấy giỏ hàng hiện tại từ localStorage
    let cart: { items: LocalCartItem[] } = { items: [] };
    const localCart = localStorage.getItem('localCart');
    if (localCart) {
      try {
        cart = JSON.parse(localCart);
        console.log('API - Retrieved existing local cart with items:', cart.items.length);
      } catch (parseError) {
        console.error('API - Error parsing local cart:', parseError);
        cart = { items: [] };
      }
    } else {
      console.log('API - No existing local cart found');
    }
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(item => 
      item.product._id === productId);
    
    if (existingItemIndex >= 0) {
      // Nếu sản phẩm đã có, cập nhật số lượng
      console.log('API - Product already in cart, updating quantity');
      cart.items[existingItemIndex].quantity += quantity;
      console.log('API - New quantity:', cart.items[existingItemIndex].quantity);
    } else {
      // Nếu sản phẩm chưa có, thêm mới
      console.log('API - Adding new product to cart');
      cart.items.push({
        product,
        quantity
      });
    }
    
    // Lưu lại giỏ hàng vào localStorage
    try {
      localStorage.setItem('localCart', JSON.stringify(cart));
      console.log('API - Saved local cart with', cart.items.length, 'items');
    } catch (storageError) {
      console.error('API - Error saving local cart to localStorage:', storageError);
    }
    
    return cart;
  } catch (error) {
    console.error('API - Error creating local cart item:', error);
    // Trả về giỏ hàng rỗng nếu có lỗi
    return { items: [] };
  }
}

export const removeFromCart = async (productId: string) => {
  try {
    console.log('API - Removing from cart, productId:', productId);
    
    // Kiểm tra người dùng đã đăng nhập chưa
    const userInfoStr = localStorage.getItem('userInfo');
    let isGuest = !userInfoStr;
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        const token = userInfo?.token || '';
        if (!token) {
          console.log('API - User info exists but no token found');
          isGuest = true;
        }
      } catch (error) {
        console.error('API - Error parsing userInfo:', error);
        isGuest = true;
      }
    }
    
    // Nếu là khách không đăng nhập, xóa khỏi giỏ hàng local
    if (isGuest) {
      console.log('API - Removing item from local cart for guest user');
      return removeFromLocalCart(productId);
    }
    
    // Người dùng đã đăng nhập, gọi API để xóa khỏi giỏ hàng
    const response = await api.delete('/api/cart/remove', { data: { productId } });
    console.log('API - Item removed from cart successfully');
    return response.data;
  } catch (error) {
    console.error('API - Error removing from cart:', error);
    // Nếu API thất bại, thử xóa khỏi giỏ hàng local
    return removeFromLocalCart(productId);
  }
};

// Hàm xóa sản phẩm khỏi giỏ hàng local
async function removeFromLocalCart(productId: string) {
  try {
    console.log('API - Removing from local cart, productId:', productId);
    
    // Lấy giỏ hàng hiện tại từ localStorage
    const localCartStr = localStorage.getItem('localCart');
    if (!localCartStr) {
      console.log('API - No local cart found, nothing to remove');
      return { items: [] };
    }
    
    try {
      const localCart = JSON.parse(localCartStr);
      if (!localCart.items || !Array.isArray(localCart.items)) {
        console.error('API - Invalid local cart format');
        return { items: [] };
      }
      
      // Lọc bỏ sản phẩm cần xóa
      const updatedItems = localCart.items.filter((item: any) => 
        item.product._id !== productId
      );
      
      console.log('API - Updated local cart items:', updatedItems.length);
      
      // Lưu lại giỏ hàng mới
      const updatedCart = { items: updatedItems };
      localStorage.setItem('localCart', JSON.stringify(updatedCart));
      
      return updatedCart;
    } catch (error) {
      console.error('API - Error processing local cart:', error);
      localStorage.removeItem('localCart'); // Xóa giỏ hàng không hợp lệ
      return { items: [] };
    }
  } catch (error) {
    console.error('API - Error removing from local cart:', error);
    return { items: [] };
  }
}

// Define interfaces for the cart response
interface CartProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  [key: string]: any; // Allow for additional properties
}

interface CartItem {
  product: CartProduct;
  quantity: number;
  [key: string]: any; // Allow for additional properties
}

interface CartResponse {
  items: CartItem[];
  [key: string]: any; // Allow for additional properties
}

export const updateCartItem = async (productId: string, quantity: number) => {
  try {
    console.log('API - Updating cart item:', { productId, quantity });
    
    // Đảm bảo dữ liệu gửi đi hợp lệ
    if (!productId) {
      console.error('API - Invalid productId for cart update');
      throw new Error('Thiếu ID sản phẩm');
    }
    
    // Đảm bảo số lượng hợp lệ và không phải NaN
    const safeQuantity = isNaN(quantity) ? 1 : Math.max(1, Math.round(quantity));
    console.log('API - Safe quantity for update:', safeQuantity);
    
    // Kiểm tra người dùng đã đăng nhập chưa
    const userInfoStr = localStorage.getItem('userInfo');
    let isGuest = !userInfoStr;
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        const token = userInfo?.token || '';
        if (!token) {
          console.log('API - User info exists but no token found');
          isGuest = true;
        }
      } catch (error) {
        console.error('API - Error parsing userInfo:', error);
        isGuest = true;
      }
    }
    
    // Nếu là khách không đăng nhập, cập nhật giỏ hàng local
    if (isGuest) {
      console.log('API - Updating local cart for guest user');
      return updateLocalCartItem(productId, safeQuantity);
    }
    
    // Cache key để lưu response tạm thời - tránh request trùng lặp
    const cacheKey = `update_cart_${productId}_${safeQuantity}`;
    
    // Thử lấy từ cache - thời gian cache rất ngắn chỉ 2 giây
    const cachedResponse = sessionStorage.getItem(cacheKey);
    if (cachedResponse) {
      console.log('API - Using cached response for cart update');
      try {
        const parsedResponse = JSON.parse(cachedResponse);
        // Đảm bảo dữ liệu cache có cấu trúc đúng
        if (parsedResponse && parsedResponse.items) {
          return parsedResponse as CartResponse;
        }
        // Xóa cache không hợp lệ nếu thiếu items
        sessionStorage.removeItem(cacheKey);
      } catch (err) {
        // Nếu parse lỗi, xóa cache không hợp lệ
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    // Gửi request cập nhật
    const response = await api.put('/api/cart/update', { 
      productId, 
      quantity: safeQuantity 
    });
    
    console.log('API - Cart update response:', response.data);
    
    // Chuẩn hóa response data có thể có cấu trúc khác nhau
    const normalizedResponse: CartResponse = { items: [] };
    
    // Kiểm tra các cấu trúc response có thể có
    if (response.data) {
      if (response.data.items && Array.isArray(response.data.items)) {
        // Cấu trúc chuẩn
        normalizedResponse.items = response.data.items;
      } else if (Array.isArray(response.data)) {
        // Trường hợp response là mảng các items trực tiếp
        normalizedResponse.items = response.data;
      } else if (response.data.cart && response.data.cart.items) {
        // Một số backend wrap trong object cart
        normalizedResponse.items = response.data.cart.items;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Format API thông thường với field data
        normalizedResponse.items = response.data.data;
      } else {
        console.warn('API - Unknown response structure, trying to find array:', response.data);
        // Tìm bất kỳ field nào là array và dùng nó
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`API - Found array in field '${key}'`);
            normalizedResponse.items = response.data[key];
            break;
          }
        }
      }
    }
    
    console.log('API - Normalized response items:', normalizedResponse.items.length);
    
    // Chuẩn hóa các items
    if (normalizedResponse.items.length > 0) {
      try {
        normalizedResponse.items = normalizedResponse.items.map((item: any) => {
          // Nếu item.product không tồn tại, thử các trường hợp khác
          if (!item.product) {
            if (item.productId || item._id) {
              // Trường hợp API chỉ trả về ID và thông tin cơ bản
              // Tìm item có sẵn trong local cart để lấy thông tin
              const localCartStr = localStorage.getItem('localCart');
              if (localCartStr) {
                try {
                  const localCart = JSON.parse(localCartStr);
                  const existingItem = localCart.items.find((localItem: any) => 
                    localItem.product._id === (item.productId || item._id || item.product_id));
                  
                  if (existingItem) {
                    console.log('API - Found product info in local cart');
                    return {
                      product: existingItem.product,
                      quantity: item.quantity || safeQuantity
                    } as CartItem;
                  }
                } catch (err) {
                  console.error('API - Error reading local cart:', err);
                }
              }
              
              // Nếu không tìm thấy trong local, tạo cấu trúc tối thiểu
              return {
                product: {
                  _id: item.productId || item._id || item.product_id,
                  name: item.name || 'Sản phẩm',
                  price: item.price || 0,
                  image: item.image || 'placeholder.jpg',
                  stock: item.stock || 10
                },
                quantity: item.quantity || safeQuantity
              } as CartItem;
            }
          }
          
          // Đảm bảo product có đầy đủ các field cần thiết
          if (item.product) {
            const product = item.product;
            // Đảm bảo các field cần thiết tồn tại
            if (!product._id) product._id = product.id || product.productId || productId;
            if (!product.name) product.name = 'Sản phẩm';
            if (!product.price) product.price = 0;
            if (!product.image) product.image = 'placeholder.jpg';
            if (!product.stock) product.stock = 10;
            
            // Đảm bảo price là số
            product.price = Number(product.price) || 0;
          }
          
          return {
            product: item.product,
            quantity: item.quantity || safeQuantity
          } as CartItem;
        });
      } catch (err) {
        console.error('API - Error normalizing items:', err);
      }
    }
    
    // Lưu cache để tránh request trùng lặp
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(normalizedResponse));
      // Xóa cache sau 2 giây
      setTimeout(() => {
        sessionStorage.removeItem(cacheKey);
      }, 2000);
    } catch (err) {
      console.warn('API - Failed to cache cart update response', err);
    }
    
    return normalizedResponse;
  } catch (error: any) {
    console.error('API - Error updating cart:', error.message || error);
    // Nếu API thất bại, cập nhật giỏ hàng local
    return updateLocalCartItem(productId, quantity);
  }
};

// Hàm cập nhật giỏ hàng local
async function updateLocalCartItem(productId: string, quantity: number) {
  try {
    console.log('API - Updating local cart for product:', productId);
    
    // Lấy giỏ hàng hiện tại từ localStorage
    let cart: { items: any[] } = { items: [] };
    const localCart = localStorage.getItem('localCart');
    
    if (localCart) {
      try {
        cart = JSON.parse(localCart);
        console.log('API - Retrieved existing local cart with items:', cart.items.length);
      } catch (parseError) {
        console.error('API - Error parsing local cart:', parseError);
        cart = { items: [] };
      }
    } else {
      console.log('API - No existing local cart found');
    }
    
    // Tìm sản phẩm trong giỏ hàng
    const existingItemIndex = cart.items.findIndex(item => 
      item.product._id === productId);
    
    if (existingItemIndex >= 0) {
      // Cập nhật số lượng
      console.log('API - Product found in cart, updating quantity');
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Nếu không tìm thấy sản phẩm, thử lấy thông tin sản phẩm và thêm mới
      console.log('API - Product not found in cart, fetching product info');
      try {
        const product = await getProductById(productId);
        cart.items.push({
          product,
          quantity
        });
      } catch (error) {
        console.error('API - Error fetching product details:', error);
        // Dùng thông tin tối thiểu nếu không lấy được chi tiết sản phẩm
        cart.items.push({
          product: {
            _id: productId,
            name: 'Sản phẩm tạm thời',
            price: 0,
            image: 'placeholder-image',
            description: 'Đang tải thông tin sản phẩm...',
            stock: 10
          },
          quantity
        });
      }
    }
    
    // Lưu lại giỏ hàng
    localStorage.setItem('localCart', JSON.stringify(cart));
    console.log('API - Updated local cart saved, now contains', cart.items.length, 'items');
    
    return cart;
  } catch (error) {
    console.error('API - Error updating local cart:', error);
    // Trả về giỏ hàng rỗng nếu có lỗi
    return { items: [] };
  }
}

export const clearCart = async () => {
  try {
    console.log('API - Clearing entire cart');
    
    // Kiểm tra người dùng đã đăng nhập chưa
    const userInfoStr = localStorage.getItem('userInfo');
    let isGuest = !userInfoStr;
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        const token = userInfo?.token || '';
        if (!token) {
          console.log('API - User info exists but no token found');
          isGuest = true;
        }
      } catch (error) {
        console.error('API - Error parsing userInfo:', error);
        isGuest = true;
      }
    }
    
    // Luôn xóa giỏ hàng local vì chúng ta sẽ làm điều này sau khi hoàn tất đặt hàng 
    // hoặc khi người dùng thực sự muốn xóa toàn bộ giỏ hàng
    try {
      localStorage.removeItem('localCart');
      console.log('API - Local cart cleared successfully');
    } catch (localError) {
      console.error('API - Error clearing local cart:', localError);
    }
    
    // Nếu là khách không đăng nhập, đã xóa giỏ hàng local rồi, trả về response rỗng
    if (isGuest) {
      console.log('API - Cart cleared for guest user');
      return { items: [] };
    }
    
    // Người dùng đã đăng nhập, gọi API để xóa giỏ hàng
    const response = await api.delete('/api/cart');
    console.log('API - Cart cleared successfully via API');
    return response.data;
  } catch (error) {
    console.error('API - Error clearing cart:', error);
    // Nếu API thất bại, vẫn đảm bảo đã xóa giỏ hàng local
    try {
      localStorage.removeItem('localCart');
    } catch (e) {}
    return { items: [] };
  }
};

// Order API calls
export const createOrder = async (orderData: {
  orderItems?: {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity?: number;
    qty?: number;
  }[];
  cartItems?: { productId: string, quantity: number }[];
  shippingAddress: ShippingAddress;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod?: string;
  sessionId?: string;
  totalPrice?: number;
}) => {
  try {
    console.log('API - Creating order with data:', JSON.stringify(orderData, null, 2));
    
    // Chuẩn bị dữ liệu đơn hàng theo đúng format backend cần
    const apiData: any = {
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'cod',
    };
    
    // Thêm cartItems nếu có
    if (orderData.cartItems && orderData.cartItems.length > 0) {
      apiData.cartItems = orderData.cartItems;
    }
    
    // Thêm orderItems nếu có (ưu tiên sử dụng trước cartItems)
    if (orderData.orderItems && orderData.orderItems.length > 0) {
      apiData.orderItems = orderData.orderItems.map(item => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty || item.quantity || 1
      }));
    }
    
    // Thêm thông tin khách nếu không đăng nhập
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      if (!orderData.guestInfo) {
        console.error('API - No userInfo and no guestInfo, cannot create order');
        throw new Error('Bạn cần đăng nhập hoặc cung cấp thông tin khách hàng để đặt hàng');
      }
      apiData.guestInfo = orderData.guestInfo;
    } else {
      try {
        const userInfo = JSON.parse(userInfoStr);
        const token = userInfo?.token || '';
        if (token) {
          // Nếu có token, thêm vào header Authorization
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('API - Found valid token, length:', token.length);
        }
      } catch (error) {
        console.error('API - Error parsing userInfo:', error);
      }
    }
    
    // Thêm sessionId nếu là khách chưa đăng nhập
    if (orderData.sessionId) {
      apiData.sessionId = orderData.sessionId;
    }
    
    // Thêm totalPrice nếu có
    if (orderData.totalPrice) {
      apiData.totalPrice = orderData.totalPrice;
    }
    
    // Gửi request đến backend
    console.log('API - Sending order to backend:', apiData);
    const response = await api.post('/api/orders', apiData);
    console.log('API - Order created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API - Error in createOrder:', error.response?.data || error.message);
    
    // Nếu có lỗi, tạo fake order cho môi trường dev
    if (process.env.NODE_ENV === 'development') {
      const fakeOrderId = 'fake_order_' + Date.now();
      const fakeOrder = {
        _id: fakeOrderId,
        orderItems: orderData.orderItems || [],
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'cod',
        totalPrice: orderData.totalPrice || 0,
        isDelivered: false,
        createdAt: new Date().toISOString(),
        message: 'Order created successfully (DEVELOPMENT MODE - FAKE RESPONSE)'
      };
      
      // Lưu fake order vào localStorage để có thể xem lại sau
      try {
        localStorage.setItem(`fakeOrder_${fakeOrderId}`, JSON.stringify(fakeOrder));
      } catch (err) {
        console.error('Failed to save fake order to localStorage:', err);
      }
      
      console.log('API - Created fake order for development:', fakeOrder);
      return fakeOrder;
    }
    
    throw error;
  }
};

export const getOrderById = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getMyOrders = async () => {
  try {
    console.log('API - Fetching user orders');
    const response = await api.get('/orders/myorders');
    console.log('API - User orders response:', response.data);
    
    // Kiểm tra và đảm bảo dữ liệu trả về là mảng
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.orders && Array.isArray(response.data.orders)) {
        return response.data.orders;
      } else {
        console.warn('API - Orders response is not an array, returning empty array');
        return [];
      }
    }
    
    return [];
  } catch (error: any) {
    console.error('API - Error fetching user orders:', error.response?.data || error.message);
    return [];
  }
};

// Recommendations API calls
export const getUserRecommendations = async () => {
  const response = await api.get('/recommend/user');
  return response.data;
};

// Admin API calls
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get('/admin/products');
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (id: string) => {
  const response = await api.put(`/admin/orders/${id}/status`);
  return response.data;
};

// Add debug function to test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', apiUrl);
    const response = await api.get('/');
    console.log('API connection test successful:', response.status);
    return true;
  } catch (error: any) {
    console.error('API connection test failed:', error.message);
    console.log('Trying alternative endpoint /products');
    try {
      const productsResponse = await api.get('/products');
      console.log('Products endpoint connection successful:', productsResponse.status);
      return true;
    } catch (productsError) {
      console.error('Products endpoint connection failed:', productsError);
      return false;
    }
  }
};

// Add debug function to test all possible API URLs
export const findWorkingApiUrl = async () => {
  for (const url of POSSIBLE_API_URLS) {
    try {
      const instance = axios.create({
        baseURL: url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 5000,
      });
      
      console.log(`Testing API URL: ${url}`);
      const response = await instance.get('/products');
      console.log(`API URL ${url} is working:`, response.status);
      
      // Nếu nhận được dữ liệu, cập nhật instance chính
      if (response.data) {
        console.log(`Using ${url} as API URL`);
        api.defaults.baseURL = url;
        return { success: true, url, data: response.data };
      }
    } catch (error) {
      console.log(`API URL ${url} is not working`);
    }
  }
  
  console.error('All API URLs failed');
  return { success: false };
};

// Thêm trực tiếp hàm fetch sản phẩm từ tất cả các định dạng API có thể
export const fetchProductsFromAllPossibleEndpoints = async () => {
  // Thử sử dụng fetch API thay vì axios
  try {
    for (const baseUrl of POSSIBLE_API_URLS) {
      try {
        const url = `${baseUrl}/products`;
        console.log(`Trying fetch to: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Success with ${url}:`, data);
          return data;
        }
      } catch (err) {
        console.log(`Fetch failed for URL`);
      }
    }
  } catch (error) {
    console.error('All fetch attempts failed:', error);
  }
  
  return null;
};

export default api; 