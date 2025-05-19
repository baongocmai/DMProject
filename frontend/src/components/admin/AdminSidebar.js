import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaBox, FaUsers, FaShoppingBag, FaList, FaTags, FaChartPie,
  FaChartBar, FaCog, FaSignOutAlt, FaAngleDown, FaAngleRight, FaStore,
  FaCreditCard, FaHammer, FaImages, FaPercent, FaShieldAlt, FaBell
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import '../../styles/AdminTheme.css';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [expanded, setExpanded] = useState({
    products: false,
    orders: false,
    customers: false,
    marketing: false,
    settings: false,
  });
  
  // Function to toggle dropdown state
  const toggleDropdown = (key) => {
    setExpanded(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Check if a parent route is active
  const isParentActive = (pathPrefix) => {
    return location.pathname.startsWith(pathPrefix);
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo-container">
          <FaStore className="admin-logo-icon" />
          <h1 className="admin-logo-text">VietShop</h1>
        </div>
      </div>
      
      <div className="admin-user-profile">
        <div className="admin-user-avatar">
          {user?.name?.charAt(0) || 'A'}
        </div>
        <div className="admin-user-details">
          <h5 className="admin-user-name">{user?.name || 'Admin User'}</h5>
          <p className="admin-user-role">Quản trị viên</p>
        </div>
      </div>
      
      <Nav className="admin-menu">
        <div className="admin-menu-section">
          <h6 className="admin-menu-label">Tổng quan</h6>
          
        <Nav.Item>
          <Link 
            to="/admin/dashboard" 
            className={`admin-menu-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
          >
            <FaHome className="admin-menu-icon" />
              <span className="admin-menu-text">Dashboard</span>
          </Link>
        </Nav.Item>
        
          <Nav.Item>
            <Link 
              to="/admin/analytics" 
              className={`admin-menu-item ${isActive('/admin/analytics') ? 'active' : ''}`}
            >
              <FaChartPie className="admin-menu-icon" />
              <span className="admin-menu-text">Thống kê</span>
            </Link>
          </Nav.Item>
        </div>
        
        <div className="admin-menu-section">
          <h6 className="admin-menu-label">Quản lý sản phẩm</h6>
        
        <Nav.Item>
          <div 
            className={`admin-menu-item dropdown-toggle ${isParentActive('/admin/products') ? 'active' : ''}`}
            onClick={() => toggleDropdown('products')}
          >
            <FaBox className="admin-menu-icon" />
              <span className="admin-menu-text">Sản phẩm</span>
              {expanded.products ? (
                <FaAngleDown className="dropdown-icon" />
              ) : (
                <FaAngleRight className="dropdown-icon" />
              )}
          </div>
          
            <div className={`admin-dropdown-menu ${expanded.products ? 'expanded' : ''}`}>
            <Link 
              to="/admin/products" 
                className={`admin-dropdown-item ${isActive('/admin/products') ? 'active' : ''}`}
            >
                <span className="dropdown-bullet"></span>
                Tất cả sản phẩm
            </Link>
            <Link 
              to="/admin/products/create" 
                className={`admin-dropdown-item ${isActive('/admin/products/create') ? 'active' : ''}`}
              >
                <span className="dropdown-bullet"></span>
                Thêm sản phẩm mới
              </Link>
              <Link 
                to="/admin/products/inventory" 
                className={`admin-dropdown-item ${isActive('/admin/products/inventory') ? 'active' : ''}`}
              >
                <span className="dropdown-bullet"></span>
                Quản lý tồn kho
            </Link>
          </div>
        </Nav.Item>
        
        <Nav.Item>
          <Link 
            to="/admin/categories" 
            className={`admin-menu-item ${isActive('/admin/categories') ? 'active' : ''}`}
          >
            <FaList className="admin-menu-icon" />
              <span className="admin-menu-text">Danh mục</span>
          </Link>
        </Nav.Item>
        </div>
        
        <div className="admin-menu-section">
          <h6 className="admin-menu-label">Bán hàng</h6>
        
        <Nav.Item>
          <div 
            className={`admin-menu-item dropdown-toggle ${isParentActive('/admin/orders') ? 'active' : ''}`}
            onClick={() => toggleDropdown('orders')}
          >
            <FaShoppingBag className="admin-menu-icon" />
              <span className="admin-menu-text">Đơn hàng</span>
              {expanded.orders ? (
                <FaAngleDown className="dropdown-icon" />
              ) : (
                <FaAngleRight className="dropdown-icon" />
              )}
          </div>
          
            <div className={`admin-dropdown-menu ${expanded.orders ? 'expanded' : ''}`}>
            <Link 
              to="/admin/orders" 
                className={`admin-dropdown-item ${isActive('/admin/orders') ? 'active' : ''}`}
            >
                <span className="dropdown-bullet"></span>
                Tất cả đơn hàng
            </Link>
            <Link 
              to="/admin/orders/pending" 
                className={`admin-dropdown-item ${isActive('/admin/orders/pending') ? 'active' : ''}`}
            >
                <span className="dropdown-bullet"></span>
                Đơn hàng mới
                <span className="admin-badge admin-badge-primary admin-notification-badge">5</span>
            </Link>
            <Link 
                to="/admin/orders/processing" 
                className={`admin-dropdown-item ${isActive('/admin/orders/processing') ? 'active' : ''}`}
            >
                <span className="dropdown-bullet"></span>
                Đang xử lý
            </Link>
          </div>
        </Nav.Item>
        
        <Nav.Item>
            <div 
              className={`admin-menu-item dropdown-toggle ${isParentActive('/admin/customers') ? 'active' : ''}`}
              onClick={() => toggleDropdown('customers')}
          >
            <FaUsers className="admin-menu-icon" />
              <span className="admin-menu-text">Khách hàng</span>
              {expanded.customers ? (
                <FaAngleDown className="dropdown-icon" />
              ) : (
                <FaAngleRight className="dropdown-icon" />
              )}
            </div>
            
            <div className={`admin-dropdown-menu ${expanded.customers ? 'expanded' : ''}`}>
              <Link 
                to="/admin/customers" 
                className={`admin-dropdown-item ${isActive('/admin/customers') ? 'active' : ''}`}
              >
                <span className="dropdown-bullet"></span>
                Tất cả khách hàng
              </Link>
              <Link 
                to="/admin/customers/groups" 
                className={`admin-dropdown-item ${isActive('/admin/customers/groups') ? 'active' : ''}`}
              >
                <span className="dropdown-bullet"></span>
                Nhóm khách hàng
          </Link>
            </div>
        </Nav.Item>
        </div>
        
        <div className="admin-menu-section">
          <h6 className="admin-menu-label">Marketing</h6>
          
          <Nav.Item>
            <div 
              className={`admin-menu-item dropdown-toggle ${isParentActive('/admin/marketing') ? 'active' : ''}`}
              onClick={() => toggleDropdown('marketing')}
            >
              <FaPercent className="admin-menu-icon" />
              <span className="admin-menu-text">Khuyến mãi</span>
              {expanded.marketing ? (
                <FaAngleDown className="dropdown-icon" />
              ) : (
                <FaAngleRight className="dropdown-icon" />
              )}
            </div>
            
            <div className={`admin-dropdown-menu ${expanded.marketing ? 'expanded' : ''}`}>
              <Link 
                to="/admin/marketing/discounts" 
                className={`admin-dropdown-item ${isActive('/admin/marketing/discounts') ? 'active' : ''}`}
              >
                <span className="dropdown-bullet"></span>
                Giảm giá
              </Link>
              <Link 
                to="/admin/marketing/coupons" 
                className={`admin-dropdown-item ${isActive('/admin/marketing/coupons') ? 'active' : ''}`}
              >
                <span className="dropdown-bullet"></span>
                Mã giảm giá
              </Link>
            </div>
          </Nav.Item>
        
        <Nav.Item>
          <Link 
              to="/admin/marketing/banner" 
              className={`admin-menu-item ${isActive('/admin/marketing/banner') ? 'active' : ''}`}
          >
              <FaImages className="admin-menu-icon" />
              <span className="admin-menu-text">Banner</span>
          </Link>
        </Nav.Item>
        </div>
        
        <div className="admin-menu-section">
          <h6 className="admin-menu-label">Hệ thống</h6>
        
        <Nav.Item>
          <div 
            className={`admin-menu-item dropdown-toggle ${isParentActive('/admin/settings') ? 'active' : ''}`}
            onClick={() => toggleDropdown('settings')}
          >
            <FaCog className="admin-menu-icon" />
              <span className="admin-menu-text">Cài đặt</span>
              {expanded.settings ? (
                <FaAngleDown className="dropdown-icon" />
              ) : (
                <FaAngleRight className="dropdown-icon" />
              )}
          </div>
          
            <div className={`admin-dropdown-menu ${expanded.settings ? 'expanded' : ''}`}>
              <Link 
                to="/admin/settings/general" 
                className={`admin-dropdown-item ${isActive('/admin/settings/general') ? 'active' : ''}`}
              >
                <span className="dropdown-bullet"></span>
                Cài đặt chung
              </Link>
            <Link 
                to="/admin/settings/payment" 
                className={`admin-dropdown-item ${isActive('/admin/settings/payment') ? 'active' : ''}`}
            >
                <span className="dropdown-bullet"></span>
                Phương thức thanh toán
            </Link>
            <Link 
                to="/admin/settings/shipping" 
                className={`admin-dropdown-item ${isActive('/admin/settings/shipping') ? 'active' : ''}`}
            >
                <span className="dropdown-bullet"></span>
                Vận chuyển
            </Link>
          </div>
        </Nav.Item>
        
          <Nav.Item>
            <Link 
              to="/admin/users" 
              className={`admin-menu-item ${isActive('/admin/users') ? 'active' : ''}`}
            >
              <FaShieldAlt className="admin-menu-icon" />
              <span className="admin-menu-text">Người dùng hệ thống</span>
            </Link>
          </Nav.Item>
        </div>
      </Nav>
      
      <div className="admin-sidebar-footer">
        <button className="admin-logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="admin-menu-icon" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 