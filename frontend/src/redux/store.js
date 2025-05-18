import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import uiReducer from './slices/uiSlice';
import { authMiddleware } from '../middleware/authMiddleware';
import { statusApi } from '../components/ApiStatus';

const store = configureStore({
  reducer: {
    // API reducers
    [api.reducerPath]: api.reducer,
    
    // Regular redux slices
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    [statusApi.reducerPath]: statusApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializability check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(api.middleware)
      .concat(statusApi.middleware)
      .concat(authMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Set up RTK Query event listeners for automatic refetching
setupListeners(store.dispatch);

export default store; 