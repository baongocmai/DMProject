import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// Import curtain effect component
import CurtainEffect from './components/animation/CurtainEffect';

// Redux store
import store from './redux/store';
import { initializeCart } from './redux/slices/cartSlice';

// Layout components - to be created later
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page components - to be created later
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import ProfilePage from './pages/ProfilePage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderPage from './pages/OrderPage';
import UserOrdersPage from './pages/UserOrdersPage';
// Admin pages will be added later

// Component để khởi tạo dữ liệu cần thiết cho ứng dụng
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Khởi tạo giỏ hàng
    store.dispatch(initializeCart());
    
    // Kiểm tra giỏ hàng trong localStorage nếu không có API
    const localCart = localStorage.getItem('localCart');
    console.log('App initializing, localCart:', localCart);
    
  }, []);
  
  return <>{children}</>;
}

// AppContent component để sử dụng useLocation hook
const AppContent: React.FC = () => {
  const location = useLocation();
  const [showAnimation, setShowAnimation] = useState(true);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);

  // Check if we're on the login or register page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    // Check if user has visited before
    const visited = localStorage.getItem('hasVisitedBefore');
    if (visited) {
      setShowAnimation(false);
      setHasVisitedBefore(true);
    } else {
      // Set flag for future visits
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  return (
    <>
      {showAnimation && !hasVisitedBefore && (
        <CurtainEffect onAnimationComplete={handleAnimationComplete} />
      )}
      
      {/* Only show Header if not on auth pages */}
      {!isAuthPage && <Header />}
      
      <Box component="main" sx={{ minHeight: isAuthPage ? '100vh' : '85vh', py: isAuthPage ? 0 : 4 }}>
        {!isAuthPage && <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/placeorder" element={<PlaceOrderPage />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/orders" element={<UserOrdersPage />} />
            {/* Admin routes will be added later */}
          </Routes>
        </Container>}
        
        {/* Render auth pages without Container to allow full customization */}
        {isAuthPage && (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        )}
      </Box>
      
      {/* Only show Footer if not on auth pages */}
      {!isAuthPage && <Footer />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppInitializer>
        <Router>
          <AppContent />
        </Router>
      </AppInitializer>
    </Provider>
  );
};

export default App;
