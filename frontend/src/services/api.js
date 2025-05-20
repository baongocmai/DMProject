import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
  timeout: 15000, // Timeout sau 15 giây
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
  
  try {
    const result = await baseQuery(args, api, extraOptions);
    
    // Better error handling
    if (result.error) {
      console.error(`API Error (${args.url || args}):`, result.error);
      
      // For 404 (Not Found) errors, provide a fallback response for certain endpoints
      if (result.error.status === 404) {
        // For product recommendations (which might not exist yet)
        if (typeof args === 'string' && args.includes('/recommend/products')) {
          console.log('Recommendation endpoint not found, returning empty results');
          return { data: { products: [] } };
        }
        
        // For deal hot products
        if ((typeof args === 'string' && args.includes('/products')) || 
            (args.url && args.url.includes('/products'))) {
          console.log('Products endpoint returned 404, returning empty results');
          return { data: { products: [] } };
        }
      }
      
      // For 500 (Server Error) provide fallback for some endpoints
      if (result.error.status === 500) {
        if ((typeof args === 'string' && args.includes('/products')) || 
            (args.url && args.url.includes('/products'))) {
          console.log('Products endpoint returned 500, returning empty results');
          return { data: { products: [] } };
        }
      }
    }
    
    return result;
  } catch (err) {
    console.error(`API Request Failed (${args.url || args}):`, err);
    return {
      error: { status: 'FETCH_ERROR', data: { message: 'Kết nối đến máy chủ thất bại' } }
    };
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithLogging,
  tagTypes: ['User', 'Product', 'Order', 'Cart', 'Wishlist', 'Category', 'Attribute', 'Customer', 'CustomerGroup', 'Discount', 'Coupon', 'Banner', 'Settings', 'DealHot'],
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
      query: (params) => ({
        url: '/orders',
        params,
      }),
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
      query: () => '/admin/orders-pending',
      providesTags: ['Order'],
    }),
    getProcessingOrders: builder.query({
      query: () => '/admin/orders-processing',
      providesTags: ['Order'],
    }),
    getShippingOrders: builder.query({
      query: () => '/admin/orders-shipping',
      providesTags: ['Order'],
    }),
    deleteAllOrders: builder.mutation({
      query: () => ({
        url: '/admin/orders/delete-all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
    getAdminOrders: builder.query({
      query: (params = {}) => {
        const { page, limit, status, search, startDate, endDate, minTotal, maxTotal } = params;
        
        // Build query string
        let queryString = '/admin/all-orders?';
        if (page) queryString += `page=${page}&`;
        if (limit) queryString += `limit=${limit}&`;
        if (status) queryString += `status=${status}&`;
        if (search) queryString += `search=${search}&`;
        if (startDate) queryString += `startDate=${startDate}&`;
        if (endDate) queryString += `endDate=${endDate}&`;
        if (minTotal !== undefined) queryString += `minTotal=${minTotal}&`;
        if (maxTotal !== undefined) queryString += `maxTotal=${maxTotal}&`;
        
        return queryString;
      },
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/order/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        'Order'
      ],
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled, getState }) {
        // Update specific order views
        try {
          // 1. Update cache for getAdminOrders
          dispatch(
          api.util.updateQueryData('getAdminOrders', undefined, (draft) => {
              if (!draft || !Array.isArray(draft)) return;
              
              const orderToUpdate = draft.find(order => 
              (order._id === id || order.id === id)
            );
            if (orderToUpdate) {
              console.log('Updating order in cache:', orderToUpdate);
              orderToUpdate.status = status;
                
                // Also update related fields
                if (status === 'delivered') {
                  orderToUpdate.isDelivered = true;
                  orderToUpdate.deliveredAt = new Date().toISOString();
                }
                
                if (status === 'paid') {
                  orderToUpdate.isPaid = true;
                  orderToUpdate.paidAt = new Date().toISOString();
                }
            }
          })
        );

          // 2. Update cache for collection specific views
          const viewsToUpdate = ['getPendingOrders', 'getProcessingOrders', 'getShippingOrders'];
          viewsToUpdate.forEach(viewName => {
            dispatch(
              api.util.updateQueryData(viewName, undefined, (draft) => {
                if (!draft || !Array.isArray(draft)) return;
                
                // Remove the order from this list if its status no longer matches
                const shouldBeInView = 
                  (viewName === 'getPendingOrders' && status === 'pending') ||
                  (viewName === 'getProcessingOrders' && status === 'processing') ||
                  (viewName === 'getShippingOrders' && status === 'shipping');
                  
                if (!shouldBeInView) {
                  const orderIndex = draft.findIndex(order => 
                    (order._id === id || order.id === id)
                  );
                  if (orderIndex !== -1) {
                    draft.splice(orderIndex, 1);
                  }
                }
              })
            );
          });
          
          // 3. Update cache for getOrderById
          dispatch(
          api.util.updateQueryData('getOrderById', id, (draft) => {
              if (!draft) return;
              
              draft.status = status;
              
              // Update related fields
              if (status === 'delivered') {
                draft.isDelivered = true;
                draft.deliveredAt = new Date().toISOString();
              }
              
              if (status === 'paid') {
                draft.isPaid = true;
                draft.paidAt = new Date().toISOString();
              }
              
              // Update statusEvents if available
              if (draft.statusEvents && Array.isArray(draft.statusEvents)) {
                const statusMap = {
                  'placed': 0,
                  'confirmed': 1,
                  'processing': 2,
                  'shipping': 3,
                  'delivered': 4,
                  'cancelled': 5
                };
                
                const currentStatusIndex = statusMap[status];
                if (currentStatusIndex !== undefined) {
                  draft.statusEvents.forEach((event, index) => {
                    if (index <= currentStatusIndex) {
                      event.isCompleted = true;
                      if (index === currentStatusIndex) {
                        event.time = new Date().toISOString();
                      }
                    }
                  });
              }
            }
          })
        );
        
          // Wait for API response
          await queryFulfilled;
          
        } catch (err) {
          console.error('Failed to update order status:', err);
        }
      }
    }),
    
    // Admin Customer Management endpoints
    getCustomers: builder.query({
      query: (params = {}) => {
        const { search, page, limit, sort } = params;
        let queryString = '/admin/customers?';
        
        if (search) queryString += `search=${encodeURIComponent(search)}&`;
        if (page) queryString += `page=${page}&`;
        if (limit) queryString += `limit=${limit}&`;
        if (sort) queryString += `sort=${sort}&`;
        
        return queryString;
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Customer', id: _id })),
              { type: 'Customer', id: 'LIST' }
            ]
          : [{ type: 'Customer', id: 'LIST' }],
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          // Ensure all customers have consistent properties
          return response.map(customer => ({
            ...customer,
            orderCount: customer.orderCount || customer.orders?.length || 0,
            totalSpent: customer.totalSpent || 0,
            lastOrderDate: customer.lastOrderDate || customer.updatedAt || customer.createdAt
          }));
        }
        return response;
      }
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
        url: `/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      // Optimistic update
      async onQueryStarted({ id, productData }, { dispatch, queryFulfilled, getState }) {
        // Update the products list optimistically
        const patchResult = dispatch(
          api.util.updateQueryData('getProducts', undefined, (draft) => {
            const productIndex = draft?.products?.findIndex(product => product._id === id);
            if (productIndex !== undefined && productIndex !== -1 && draft?.products) {
              draft.products[productIndex] = { ...draft.products[productIndex], ...productData };
            }
          })
        );
        
        try {
          // Wait for the actual update to complete
          const { data } = await queryFulfilled;
          console.log('Product update successful:', data);
        } catch (err) {
          // If the server rejects the update, revert the optimistic update
          patchResult.undo();
          console.error('Failed to update product, reverting optimistic update:', err);
          
          // Despite API error, let's update the UI to simulate success
          // This is a workaround if your backend isn't fully implemented
          if (err.error?.status === 404) {
            console.log('404 error detected, applying local update only');
            
            // Re-apply the update locally even though the API failed
            dispatch(
              api.util.updateQueryData('getProducts', undefined, (draft) => {
                const productIndex = draft?.products?.findIndex(product => product._id === id);
                if (productIndex !== undefined && productIndex !== -1 && draft?.products) {
                  draft.products[productIndex] = { ...draft.products[productIndex], ...productData };
                }
              })
            );
            
            // Throw a different error to prevent the failure state
            throw new Error('API update failed but local update applied');
          }
        }
      },
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
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
    
    // Frequently bought together products for admin
    getFrequentlyBoughtTogether: builder.query({
      query: (params = {}) => {
        return {
          url: `/admin/reports/frequently-bought-together`,
          params: {
            minSupport: params.minSupport || 0.0000001,
            limit: params.limit || 100,
            orderLimit: params.orderLimit || 10000000
          },
        };
      },
      providesTags: ["Analytics"],
      keepUnusedDataFor: 0, // Không cache, luôn lấy dữ liệu mới
      transformResponse: (response) => {
        if (response && response.frequentItemsets && response.frequentItemsets.length > 0) {
          // Chuẩn hóa dữ liệu
          const normalizedData = {
            ...response,
            frequentItemsets: response.frequentItemsets.map(itemset => ({
              ...itemset,
              support: itemset.support > 1 ? itemset.support / 100 : itemset.support, // Chuẩn hóa giá trị support
              frequency: itemset.frequency || itemset.count || 0, // Đảm bảo frequency tồn tại
              products: Array.isArray(itemset.products) ? itemset.products : [] // Đảm bảo products là mảng
            }))
          };
          
          return normalizedData;
        } else {
          return { frequentItemsets: [] };
        }
      },
    }),
    
    // Coupon endpoints
    validateCoupon: builder.mutation({
      query: (couponCode) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: { couponCode },
      }),
    }),
    
    // New endpoint for deal hot products
    getDealHot: builder.query({
      query: (params = {}) => {
        const { limit = 10 } = params;
        return `/products/deal-hot?limit=${limit}`;
      },
      providesTags: ['DealHot', 'Product'],
      keepUnusedDataFor: 60, // Cache for 1 minute only to ensure fresh data
      transformResponse: (response) => {
        console.log("Processing Deal Hot products from API:", response);
        
        // Handle empty or invalid response
        if (!response || !response.products || response.products.length === 0) {
          console.warn("No Deal Hot products found in database");
          return { products: [] };
        }
        
        // Filter products that have sale prices and check valid date range
        if (response && response.products) {
          const now = new Date();
          const dealProducts = response.products.filter(product => {
            // Must have a sale price lower than regular price
            const hasValidPrice = product.salePrice && product.salePrice < product.price;
            
            // Check if deal is within date range (if dates are specified)
            let isWithinDateRange = true;
            if (product.dealStartDate) {
              const startDate = new Date(product.dealStartDate);
              if (now < startDate) isWithinDateRange = false;
            }
            
            if (product.dealEndDate) {
              const endDate = new Date(product.dealEndDate);
              if (now > endDate) isWithinDateRange = false;
            }
            
            return hasValidPrice && isWithinDateRange;
          });
          
          if (dealProducts.length === 0) {
            console.warn("No products with valid sale prices and date ranges found in Deal Hot category");
          } else {
            console.log(`Found ${dealProducts.length} Deal Hot products with valid sale prices and date ranges`);
          }
          
          // Sort by discount percentage
          dealProducts.sort((a, b) => {
            const discountA = (a.price - a.salePrice) / a.price;
            const discountB = (b.price - b.salePrice) / b.price;
            return discountB - discountA; // Highest discount first
          });
          
          return {
            ...response,
            products: dealProducts
          };
        }
        
        return response;
      }
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
  useGetFrequentlyBoughtTogetherQuery,
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
  useGetShippingOrdersQuery,
  useDeleteAllOrdersMutation,
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
  useGetDealHotQuery,
} = api; 