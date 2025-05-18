import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Spinner } from 'react-bootstrap';
import { 
  FaUser, 
  FaShoppingBag, 
  FaHeart, 
  FaMapMarkerAlt, 
  FaCreditCard, 
  FaBell, 
  FaGift, 
  FaSignOutAlt,
  FaChevronRight
} from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { useGetUserProfileQuery } from '../services/api';
import SlidingDrawer from './SlidingDrawer';
import './AccountDrawer.css';

const AccountDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: userProfile, error: profileError, isLoading: profileLoading, refetch: refetchProfile } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true
  });

  // Sync user profile data with backend when drawer opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refetchProfile();
    }
  }, [isOpen, isAuthenticated, refetchProfile]);
  
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    onClose();
    navigate('/login');
  };

  const profileOptions = [
    {
      id: 'orders',
      name: 'My Orders',
      icon: <FaShoppingBag color="#D25B70" size={20} />,
      onClick: () => {
        navigate('/orders');
        onClose();
      },
    },
    {
      id: 'wishlist',
      name: 'My Wishlist',
      icon: <FaHeart color="#D25B70" size={20} />,
      onClick: () => {
        navigate('/wishlist');
        onClose();
      },
    },
    {
      id: 'address',
      name: 'Manage Address',
      icon: <FaMapMarkerAlt color="#D25B70" size={20} />,
      onClick: () => {
        navigate('/profile/address');
        onClose();
      },
    },
    {
      id: 'payment',
      name: 'Payment Methods',
      icon: <FaCreditCard color="#D25B70" size={20} />,
      onClick: () => {
        navigate('/payment');
        onClose();
      },
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <FaBell color="#D25B70" size={20} />,
      onClick: () => {
        navigate('/notifications');
        onClose();
      },
    },
    {
      id: 'offers',
      name: 'Offers & Promotions',
      icon: <FaGift color="#D25B70" size={20} />,
      onClick: () => {
        navigate('/offers');
        onClose();
      },
    }
  ];

  return (
    <SlidingDrawer isOpen={isOpen} onClose={onClose} title="My Account" position="right">
      {!isAuthenticated ? (
        <div className="account-drawer-login">
          <div className="account-drawer-login-message">
            <h3>Welcome to our store!</h3>
            <p>Please sign in to view your account details and orders.</p>
            <div className="account-drawer-buttons">
              <Button 
                variant="primary" 
                className="signin-btn"
                onClick={() => {
                  navigate('/login');
                  onClose();
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="outline-secondary" 
                className="register-btn"
                onClick={() => {
                  navigate('/register');
                  onClose();
                }}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      ) : profileLoading ? (
        <div className="drawer-loading">
          <Spinner animation="border" variant="primary" />
          <p>Loading your account...</p>
        </div>
      ) : profileError ? (
        <div className="drawer-error">
          <p>Error loading your account information. Please try again.</p>
          <Button 
            variant="outline-primary" 
            onClick={refetchProfile}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="account-drawer-header">
            <div className="user-avatar">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.name} />
              ) : (
                <div className="avatar-placeholder">
                  {userProfile?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <h3 className="user-name">{userProfile?.name || 'User'}</h3>
            <p className="user-email">{userProfile?.email || 'user@example.com'}</p>
          </div>
          
          <div className="account-drawer-options">
            {profileOptions.map((option) => (
              <div 
                key={option.id} 
                className="account-option-item"
                onClick={option.onClick}
              >
                <div className="option-left">
                  <div className="option-icon">
                    {option.icon}
                  </div>
                  <div className="option-name">
                    {option.name}
                  </div>
                </div>
                <div className="option-right">
                  <FaChevronRight color="#666" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="account-drawer-footer">
            <Button 
              variant="link" 
              className="logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="logout-icon" /> Log Out
            </Button>
          </div>
        </>
      )}
    </SlidingDrawer>
  );
};

export default AccountDrawer; 