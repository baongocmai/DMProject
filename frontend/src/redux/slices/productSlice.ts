import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';
import * as api from '../../services/api';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getProducts();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách sản phẩm thất bại');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'product/fetchProductDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      return await api.getProductById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin sản phẩm thất bại');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'product/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      console.log('ProductSlice - Skipping recommendations API call');
      // Return empty recommendations instead of calling the API
      return [];
    } catch (error: any) {
      console.error('ProductSlice - Failed to fetch recommendations:', error.message);
      return rejectWithValue(error.response?.data?.message || 'Lấy gợi ý sản phẩm thất bại');
    }
  }
);

interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  recommendations: string[][];
}

// Get products from localStorage or use empty array as default
const getSavedProducts = (): Product[] => {
  try {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
  } catch (error) {
    console.error('Error parsing products from localStorage:', error);
  }
  return [];
};

// Get saved product details from localStorage
const getSavedProductDetails = (): Product | null => {
  try {
    const savedProduct = localStorage.getItem('productDetails');
    if (savedProduct) {
      return JSON.parse(savedProduct);
    }
  } catch (error) {
    console.error('Error parsing product details from localStorage:', error);
  }
  return null;
};

const initialState: ProductState = {
  products: getSavedProducts(),
  product: getSavedProductDetails(),
  loading: false,
  error: null,
  recommendations: [],
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductDetails: (state) => {
      state.product = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('ProductSlice - fetchProducts.pending');
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
        console.log('ProductSlice - fetchProducts.fulfilled with products:', action.payload);
        
        // Save products to localStorage
        try {
          localStorage.setItem('products', JSON.stringify(action.payload));
        } catch (error) {
          console.error('Error saving products to localStorage:', error);
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('ProductSlice - fetchProducts.rejected with error:', action.payload);
      })
      // Fetch product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('ProductSlice - fetchProductDetails.pending');
      })
      .addCase(fetchProductDetails.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.product = action.payload;
        console.log('ProductSlice - fetchProductDetails.fulfilled with product:', action.payload);
        
        // Save product details to localStorage
        try {
          localStorage.setItem('productDetails', JSON.stringify(action.payload));
        } catch (error) {
          console.error('Error saving product details to localStorage:', error);
        }
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('ProductSlice - fetchProductDetails.rejected with error:', action.payload);
      })
      // Fetch recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action: PayloadAction<string[][]>) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProductDetails, clearErrors } = productSlice.actions;
export default productSlice.reducer; 