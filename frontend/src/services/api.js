import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  mockDashboardStats, mockProductAnalytics, mockUserAnalytics, mockOrderAnalytics,
  mockCategories, mockAttributes, mockPendingOrders, mockProcessingOrders,
  mockCustomers, mockCustomerGroups, mockDiscounts, mockCoupons, mockBanners,
  mockGeneralSettings, mockPaymentSettings, mockShippingSettings, mockUsers
} from './mockApiData';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Optimized baseQuery with minimal logging
const baseQueryWithLogging = async (args, api, extraOptions) => {
  if (extraOptions?.skipIfUnauthenticated) {
    const state = api.getState();
    const isAuthenticated = state.auth?.isAuthenticated;
    
    if (!isAuthenticated) {
      return {
        data: null,
        meta: { skipped: true }
      };
    }
  }
  
  // Check if we're in development and should use mock data
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_API === 'true') {
    // Extract endpoint from args
    const endpoint = typeof args === 'string' ? args : args.url;
    
    // Mock response based on endpoint
    if (endpoint === '/dashboard/stats') {
      return { data: mockDashboardStats };
    } else if (endpoint === '/analytics/products') {
      return { data: mockProductAnalytics };
    } else if (endpoint === '/analytics/users') {
      return { data: mockUserAnalytics };
    } else if (endpoint === '/analytics/orders') {
      return { data: mockOrderAnalytics };
    } else if (endpoint === '/admin/categories') {
      return { data: mockCategories };
    } else if (endpoint === '/admin/attributes') {
      return { data: mockAttributes };
    } else if (endpoint === '/admin/orders/pending') {
      return { data: mockPendingOrders };
    } else if (endpoint === '/admin/orders/processing') {
      return { data: mockProcessingOrders };
    } else if (endpoint === '/admin/customers') {
      return { data: mockCustomers };
    } else if (endpoint === '/admin/customers/groups') {
      return { data: mockCustomerGroups };
    } else if (endpoint === '/admin/marketing/discounts') {
      return { data: mockDiscounts };
    } else if (endpoint === '/admin/marketing/coupons') {
      return { data: mockCoupons };
    } else if (endpoint === '/admin/marketing/banners') {
      return { data: mockBanners };
    } else if (endpoint === '/admin/settings/general') {
      return { data: mockGeneralSettings };
    } else if (endpoint === '/admin/settings/payment') {
      return { data: mockPaymentSettings };
    } else if (endpoint === '/admin/settings/shipping') {
      return { data: mockShippingSettings };
    } else if (endpoint === '/admin/users') {
      return { data: mockUsers };
    }
  }
  
  try {
    const result = await baseQuery(args, api, extraOptions);
    
    if (result.error) {
      console.error('API Error:', result.error);
      
      // For analytics endpoints, return mock data on error
      if ((args.url === '/analytics/products' || args.url === '/api/analytics/products') && result.error.status === 404) {
        console.log('Using mock product analytics data');
        return { data: mockProductAnalytics };
      }
      
      if ((args.url === '/analytics/users' || args.url === '/api/analytics/users') && result.error.status === 404) {
        console.log('Using mock user analytics data');
        return { data: mockUserAnalytics };
      }
      
      if ((args.url === '/analytics/orders' || args.url === '/api/analytics/orders') && result.error.status === 404) {
        console.log('Using mock order analytics data');
        return { data: mockOrderAnalytics };
      }
      
      if ((args.url === '/dashboard/stats' || args.url === '/api/dashboard/stats') && result.error.status === 404) {
        console.log('Using mock dashboard stats data');
        return { data: mockDashboardStats };
      }

      // For category endpoints
      if ((args.url === '/admin/categories' || args.url === '/api/admin/categories') && result.error.status === 404) {
        console.log('Using mock categories data');
        return { data: mockCategories };
      }
      
      // For attribute endpoints
      if ((args.url === '/admin/attributes' || args.url === '/api/admin/attributes') && result.error.status === 404) {
        console.log('Using mock attributes data');
        return { data: mockAttributes };
      }
      
      // For order management endpoints
      if ((args.url === '/admin/orders/pending' || args.url === '/api/admin/orders/pending') && result.error.status === 404) {
        console.log('Using mock pending orders data');
        return { data: mockPendingOrders };
      }
      
      if ((args.url === '/admin/orders/processing' || args.url === '/api/admin/orders/processing') && result.error.status === 404) {
        console.log('Using mock processing orders data');
        return { data: mockProcessingOrders };
      }
      
      // For customer management endpoints
      if ((args.url === '/admin/customers' || args.url === '/api/admin/customers') && result.error.status === 404) {
        console.log('Using mock customers data');
        return { data: mockCustomers };
      }
      
      if ((args.url === '/admin/customers/groups' || args.url === '/api/admin/customers/groups') && result.error.status === 404) {
        console.log('Using mock customer groups data');
        return { data: mockCustomerGroups };
      }
      
      // For marketing endpoints
      if ((args.url === '/admin/marketing/discounts' || args.url === '/api/admin/marketing/discounts') && result.error.status === 404) {
        console.log('Using mock discounts data');
        return { data: mockDiscounts };
      }
      
      if ((args.url === '/admin/marketing/coupons' || args.url === '/api/admin/marketing/coupons') && result.error.status === 404) {
        console.log('Using mock coupons data');
        return { data: mockCoupons };
      }
      
      if ((args.url === '/admin/marketing/banners' || args.url === '/api/admin/marketing/banners') && result.error.status === 404) {
        console.log('Using mock banners data');
        return { data: mockBanners };
      }
      
      // For settings endpoints
      if ((args.url === '/admin/settings/general' || args.url === '/api/admin/settings/general') && result.error.status === 404) {
        console.log('Using mock general settings data');
        return { data: mockGeneralSettings };
      }
      
      if ((args.url === '/admin/settings/payment' || args.url === '/api/admin/settings/payment') && result.error.status === 404) {
        console.log('Using mock payment settings data');
        return { data: mockPaymentSettings };
      }
      
      if ((args.url === '/admin/settings/shipping' || args.url === '/api/admin/settings/shipping') && result.error.status === 404) {
        console.log('Using mock shipping settings data');
        return { data: mockShippingSettings };
      }
    }
    
    return result;
  } catch (error) {
    return {
      error: {
        status: 'FETCH_ERROR',
        error: error.message || 'Unknown error occurred'
      }
    };
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithLogging,
  tagTypes: ['User', 'Product', 'Order', 'Cart', 'Wishlist', 'Category', 'Attribute', 'Customer', 'CustomerGroup', 'Discount', 'Coupon', 'Banner', 'Settings'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: '/users/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resendOTP: builder.mutation({
      query: (data) => ({
        url: '/users/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/users/forgot-password',
        method: 'POST',
        body: email,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/users/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    // User endpoints
    getUserProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    addToWishlist: builder.mutation({
      query: (productId) => ({
        url: '/users/wishlist',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['User', 'Wishlist'],
    }),
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `/users/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Wishlist'],
    }),
    getWishlist: builder.query({
      query: () => '/users/wishlist',
      providesTags: ['User', 'Wishlist'],
    }),
    trackProductView: builder.mutation({
      query: (productId) => ({
        url: '/users/track-view',
        method: 'POST',
        body: { productId },
      }),
    }),
    
    // Product endpoints
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProductById: builder.query({
      query: (id) => ({
        url: `/products/${id}`,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }),
      providesTags: ['Product'],
    }),
    getFeaturedProducts: builder.query({
      query: () => '/products/featured',
      providesTags: ['Product'],
    }),
    getProductReviews: builder.query({
      query: (id) => `/products/${id}/reviews`,
      providesTags: ['Product'],
    }),
    getRelatedProducts: builder.query({
      query: (id) => `/products/${id}/related`,
      providesTags: ['Product'],
    }),
    addProductReview: builder.mutation({
      query: ({ id, review }) => ({
        url: `/products/${id}/reviews`,
        method: 'POST',
        body: review,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProductReview: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    
    // Cart endpoints
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (item) => ({
        url: '/cart/add',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ id, quantity }) => ({
        url: '/cart/update',
        method: 'PUT',
        body: { id, quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation({
      query: (id) => ({
        url: `/cart/remove/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    
    // Order endpoints
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      transformResponse: (response) => {
        if (!response.statusEvents && response.order) {
          return {
            ...response.order,
            statusEvents: [
              { status: 'placed', time: response.order.createdAt, isCompleted: true },
              { status: 'confirmed', time: null, isCompleted: false },
              { status: 'shipping', time: null, isCompleted: false },
              { status: 'delivered', time: null, isCompleted: false }
            ]
          };
        }
        if (response.order) {
          return response.order;
        }
        return response;
      },
      providesTags: ['Order'],
    }),
    updateOrderToPaid: builder.mutation({
      query: ({ id, paymentResult }) => ({
        url: `/orders/${id}/pay`,
        method: 'PUT',
        body: paymentResult,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderToDelivered: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
    
    // Admin endpoints
    getUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, userData }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    
    // Admin Category endpoints
    getCategories: builder.query({
      query: () => '/admin/categories',
      providesTags: ['Category'],
    }),
    getCategoryById: builder.query({
      query: (id) => `/admin/categories/${id}`,
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/admin/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, categoryData }) => ({
        url: `/admin/categories/${id}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    
    // Admin Attribute endpoints
    getAttributes: builder.query({
      query: () => '/admin/attributes',
      providesTags: ['Attribute'],
    }),
    getAttributeById: builder.query({
      query: (id) => `/admin/attributes/${id}`,
      providesTags: ['Attribute'],
    }),
    createAttribute: builder.mutation({
      query: (attributeData) => ({
        url: '/admin/attributes',
        method: 'POST',
        body: attributeData,
      }),
      invalidatesTags: ['Attribute'],
    }),
    updateAttribute: builder.mutation({
      query: ({ id, attributeData }) => ({
        url: `/admin/attributes/${id}`,
        method: 'PUT',
        body: attributeData,
      }),
      invalidatesTags: ['Attribute'],
    }),
    deleteAttribute: builder.mutation({
      query: (id) => ({
        url: `/admin/attributes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attribute'],
    }),
    
    // Admin Order Management endpoints
    getPendingOrders: builder.query({
      query: () => '/admin/orders/pending',
      providesTags: ['Order'],
    }),
    getProcessingOrders: builder.query({
      query: () => '/admin/orders/processing',
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        'Order'
      ],
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled, getState }) {
        // 1. Cập nhật cache cho getAdminOrders
        const patchResult1 = dispatch(
          api.util.updateQueryData('getAdminOrders', undefined, (draft) => {
            const orderToUpdate = draft?.find(order => 
              (order._id === id || order.id === id)
            );
            if (orderToUpdate) {
              console.log('Updating order in cache:', orderToUpdate);
              orderToUpdate.status = status;
            } else {
              console.log('Order not found in cache:', id);
            }
          })
        );

        // 2. Cập nhật cache cho getOrderById nếu có
        const patchResult2 = dispatch(
          api.util.updateQueryData('getOrderById', id, (draft) => {
            if (draft) {
              console.log('Updating order detail in cache:', draft);
              draft.status = status;
              
              // Cập nhật các trường khác liên quan
              if (status === 'delivered') {
                draft.isDelivered = true;
                draft.deliveredAt = new Date().toISOString();
              }
              
              if (status === 'paid') {
                draft.isPaid = true;
                draft.paidAt = new Date().toISOString();
              }
            }
          })
        );
        
        try {
          // Chờ kết quả từ API
          const { data } = await queryFulfilled;
          console.log('Order status update successful:', data);
        } catch (err) {
          // Nếu API thất bại, undo lại các thay đổi cache
          patchResult1.undo();
          patchResult2.undo();
          console.error('Failed to update order status, reverting cache:', err);
        }
      }
    }),
    
    // Admin Customer Management endpoints
    getCustomers: builder.query({
      query: () => '/admin/customers',
      providesTags: ['Customer'],
    }),
    getCustomerById: builder.query({
      query: (id) => `/admin/customers/${id}`,
      providesTags: ['Customer'],
    }),
    getCustomerGroups: builder.query({
      query: () => '/admin/customers/groups',
      providesTags: ['CustomerGroup'],
    }),
    createCustomerGroup: builder.mutation({
      query: (groupData) => ({
        url: '/admin/customers/groups',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['CustomerGroup'],
    }),
    updateCustomerGroup: builder.mutation({
      query: ({ id, groupData }) => ({
        url: `/admin/customers/groups/${id}`,
        method: 'PUT',
        body: groupData,
      }),
      invalidatesTags: ['CustomerGroup'],
    }),
    deleteCustomerGroup: builder.mutation({
      query: (id) => ({
        url: `/admin/customers/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomerGroup'],
    }),
    
    // Admin Marketing endpoints
    getDiscounts: builder.query({
      query: () => '/admin/marketing/discounts',
      providesTags: ['Discount'],
    }),
    createDiscount: builder.mutation({
      query: (discountData) => ({
        url: '/admin/marketing/discounts',
        method: 'POST',
        body: discountData,
      }),
      invalidatesTags: ['Discount'],
    }),
    updateDiscount: builder.mutation({
      query: ({ id, discountData }) => ({
        url: `/admin/marketing/discounts/${id}`,
        method: 'PUT',
        body: discountData,
      }),
      invalidatesTags: ['Discount'],
    }),
    deleteDiscount: builder.mutation({
      query: (id) => ({
        url: `/admin/marketing/discounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Discount'],
    }),
    
    getCoupons: builder.query({
      query: () => '/admin/marketing/coupons',
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation({
      query: (couponData) => ({
        url: '/admin/marketing/coupons',
        method: 'POST',
        body: couponData,
      }),
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, couponData }) => ({
        url: `/admin/marketing/coupons/${id}`,
        method: 'PUT',
        body: couponData,
      }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/admin/marketing/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),
    
    getBanners: builder.query({
      query: () => '/admin/marketing/banners',
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation({
      query: (bannerData) => ({
        url: '/admin/marketing/banners',
        method: 'POST',
        body: bannerData,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation({
      query: ({ id, bannerData }) => ({
        url: `/admin/marketing/banners/${id}`,
        method: 'PUT',
        body: bannerData,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/admin/marketing/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
    
    // Admin Settings endpoints
    getGeneralSettings: builder.query({
      query: () => '/admin/settings/general',
      providesTags: ['Settings'],
    }),
    updateGeneralSettings: builder.mutation({
      query: (settingsData) => ({
        url: '/admin/settings/general',
        method: 'PUT',
        body: settingsData,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    getPaymentSettings: builder.query({
      query: () => '/admin/settings/payment',
      providesTags: ['Settings'],
    }),
    updatePaymentSettings: builder.mutation({
      query: (settingsData) => ({
        url: '/admin/settings/payment',
        method: 'PUT',
        body: settingsData,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    getShippingSettings: builder.query({
      query: () => '/admin/settings/shipping',
      providesTags: ['Settings'],
    }),
    updateShippingSettings: builder.mutation({
      query: (settingsData) => ({
        url: '/admin/settings/shipping',
        method: 'PUT',
        body: settingsData,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/admin/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, productData }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    getAdminOrders: builder.query({
      query: () => '/admin/orders',
      providesTags: ['Order'],
    }),
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
    }),
    
    // Analytics endpoints
    getProductAnalytics: builder.query({
      query: () => '/analytics/products',
    }),
    getUserAnalytics: builder.query({
      query: () => '/analytics/users',
    }),
    getOrderAnalytics: builder.query({
      query: () => '/analytics/orders',
    }),
    
    // Recommendation engine
    getRecommendedProducts: builder.query({
      query: () => '/recommend/products',
      providesTags: ['Product'],
    }),
    
    // Coupon endpoints
    validateCoupon: builder.mutation({
      query: (couponCode) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: { couponCode },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
  useTrackProductViewMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useGetProductReviewsQuery,
  useGetRelatedProductsQuery,
  useAddProductReviewMutation,
  useDeleteProductReviewMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderToPaidMutation,
  useUpdateOrderToDeliveredMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAdminOrdersQuery,
  useGetDashboardStatsQuery,
  useGetProductAnalyticsQuery,
  useGetUserAnalyticsQuery,
  useGetOrderAnalyticsQuery,
  useGetRecommendedProductsQuery,
  useValidateCouponMutation,
  // New admin endpoints
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAttributesQuery,
  useGetAttributeByIdQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useGetPendingOrdersQuery,
  useGetProcessingOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerGroupsQuery,
  useCreateCustomerGroupMutation,
  useUpdateCustomerGroupMutation,
  useDeleteCustomerGroupMutation,
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
  useGetPaymentSettingsQuery,
  useUpdatePaymentSettingsMutation,
  useGetShippingSettingsQuery,
  useUpdateShippingSettingsMutation,
} = api; 