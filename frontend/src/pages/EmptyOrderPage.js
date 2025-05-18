import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaWallet } from 'react-icons/fa';

const EmptyOrderPage = () => {
  return (
    <div className="empty-order-container">
      {/* User Avatar */}
      <div className="user-avatar-container">
        <div className="user-avatar"></div>
      </div>
      
      {/* Empty Cart Illustration */}
      <div className="empty-cart-illustration">
        <img 
          src="/images/empty-orders.png" 
          alt="Empty orders" 
          className="empty-cart-image" 
        />
      </div>
      
      {/* Empty Message */}
      <div className="empty-message">
        <p className="message-main">No orders have been placed yet.</p>
        <p className="message-sub">Discover and order now</p>
      </div>
      
      {/* Bottom Navigation */}
      <div className="bottom-navigation">
        <Link to="/" className="nav-item">
          <div className="nav-icon">
            <FaHome />
          </div>
          <span>Grocery</span>
        </Link>
        <div className="nav-item active">
          <div className="cart-icon-circle">
            <FaShoppingCart />
            <span className="cart-total">$38<span className="decimals">00</span></span>
          </div>
        </div>
        <Link to="/profile" className="nav-item">
          <div className="nav-icon">
            <FaWallet />
          </div>
          <span>Order</span>
        </Link>
      </div>
    </div>
  );
};

export default EmptyOrderPage; 