# Retail Web App - Backend API

This is the backend API for the Retail Web Application. It's built with Node.js, Express, and MongoDB.

## Features

- User authentication (login, register, password reset)
- User roles (guest, user, admin)
- Product management
- Shopping cart functionality (supports both registered users and guests)
- Order processing
- Product recommendations
- Admin dashboard and analytics

## API Endpoints

### User Endpoints
- POST /api/users/register - Register a new user
- POST /api/users/verify-otp - Verify account with OTP
- POST /api/users/resend-otp - Resend verification OTP
- POST /api/users/login - Login
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile
- POST /api/users/forgot-password - Request password reset
- POST /api/users/reset-password - Reset password
- POST /api/users/wishlist - Add product to wishlist
- GET /api/users/wishlist - Get wishlist
- DELETE /api/users/wishlist/:id - Remove product from wishlist

### Product Endpoints
- GET /api/products - Get all products
- GET /api/products/:id - Get product by ID

### Cart Endpoints
- POST /api/cart/add - Add product to cart (works for both users and guests)
- GET /api/cart - Get cart (works for both users and guests)
- PUT /api/cart/update - Update cart item
- DELETE /api/cart/remove - Remove item from cart
- DELETE /api/cart/clear - Clear cart
- POST /api/cart/merge - Merge guest cart into user cart

### Order Endpoints
- POST /api/orders - Create order (works for both users and guests)
- GET /api/orders/myorders - Get user's orders
- GET /api/orders/:id - Get order by ID
- GET /api/orders/guest/:id/:email - Get guest order

### Admin Endpoints
- GET /api/admin/users - Get all users
- GET /api/admin/users/:id - Get user by ID
- PUT /api/admin/users/:id - Update user
- DELETE /api/admin/users/:id - Delete user
- GET /api/admin/products - Get all products
- DELETE /api/admin/products/:id - Delete product
- GET /api/admin/orders - Get all orders
- PUT /api/admin/orders/:id - Update order status
- GET /api/admin/dashboard - Get dashboard statistics
- GET /api/admin/reports/sales - Get sales reports
- GET /api/admin/reports/top-products - Get top products
- GET /api/admin/reports/user-analytics - Get user analytics

### Analytics Endpoints
- POST /api/analytics/track - Track user behavior
- GET /api/analytics/recommendations - Get personalized recommendations
- GET /api/analytics/popular - Get popular products
- GET /api/analytics/related/:productId - Get related products

## Setup Instructions

1. Clone this repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on the `.env.example` template
4. Start the server with `npm start` or `npm run dev` for development

## Environment Variables

The following environment variables need to be configured:

- PORT - Port number for the server (default: 5000)
- MONGO_URI - MongoDB connection string
- JWT_SECRET - Secret key for JWT token generation
- EMAIL_USER - Email for sending notifications
- EMAIL_PASS - Password for the email account

## Technologies Used

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email sending 