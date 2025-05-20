import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Form, Button, NavDropdown, Badge, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaSearch, FaHeart, FaBars, FaBell, FaRegHeart } from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { useGetCartQuery } from '../services/api';
import CartDrawer from './CartDrawer';
import AccountDrawer from './AccountDrawer';
import './Header.css';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { data: cart } = useGetCartQuery(undefined, {
    skip: !isAuthenticated
  });
  
  // Số lượng sản phẩm trong giỏ hàng từ Redux store
  const cartItemCount = cartItems.length;
  document.addEventListener("DOMContentLoaded", function () {
  const dropdowns = document.querySelectorAll(".categories-nav .dropdown");

  dropdowns.forEach(function (dropdown) {
    dropdown.addEventListener("mouseenter", function () {
      const toggle = this.querySelector(".dropdown-toggle");
      const menu = this.querySelector(".dropdown-menu");

      toggle.classList.add("show");
      menu.classList.add("show");
    });

    dropdown.addEventListener("mouseleave", function () {
      const toggle = this.querySelector(".dropdown-toggle");
      const menu = this.querySelector(".dropdown-menu");

      toggle.classList.remove("show");
      menu.classList.remove("show");
    });
  });
});

  
  // Handle scroll event to add shadow to header on scroll
  useEffect(() => {
  const dropdowns = document.querySelectorAll(".categories-nav .dropdown");

  const handleMouseEnter = (e) => {
    const toggle = e.currentTarget.querySelector(".dropdown-toggle");
    const menu = e.currentTarget.querySelector(".dropdown-menu");
    toggle?.classList.add("show");
    menu?.classList.add("show");
  };

  const handleMouseLeave = (e) => {
    const toggle = e.currentTarget.querySelector(".dropdown-toggle");
    const menu = e.currentTarget.querySelector(".dropdown-menu");
    toggle?.classList.remove("show");
    menu?.classList.remove("show");
  };

  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("mouseenter", handleMouseEnter);
    dropdown.addEventListener("mouseleave", handleMouseLeave);
  });

  return () => {
    dropdowns.forEach((dropdown) => {
      dropdown.removeEventListener("mouseenter", handleMouseEnter);
      dropdown.removeEventListener("mouseleave", handleMouseLeave);
    });
  };
}, []);

  
  const logoutHandler = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm}`);
      setIsNavExpanded(false); // Close mobile menu on search
    }
  };
  
  const toggleNav = () => {
    setIsNavExpanded(!isNavExpanded);
  };
  
  // Check if current page is active for navigation
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const openCartDrawer = (e) => {
    e.preventDefault();
    setIsCartOpen(true);
  };

  const openAccountDrawer = (e) => {
    e.preventDefault();
    setIsAccountOpen(true);
  };
  
  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Account Drawer */}
      <AccountDrawer isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
      
      {/* Top Bar with promotions or announcements */}
      <div className="header-topbar">
        <Container>
          <div className="topbar-content">
            <div className="topbar-promo">
              <span>Miễn phí ship cho đơn hàng trên 300.000 VNĐ</span>
            </div>
            <div className="topbar-links">
              {isAuthenticated ? (
                <a href="#" onClick={openAccountDrawer} className="welcome-message">Chào mừng, {user?.name || 'Người dùng'}</a>
              ) : (
                <a href="#" onClick={openAccountDrawer}>Đăng nhập / Đăng ký</a>
              )}
            </div>
          </div>
        </Container>
      </div>
    
      {/* Main Header with navigation */}
      
      <Navbar 
        bg="white" 
        variant="light" 
        expand="lg" 
        className={`header-main ${isNavExpanded ? 'expanded' : ''}`} 
        expanded={isNavExpanded}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand">
            <span className="brand-name">2NADH</span>
            <span className="brand-tagline">Siêu thị bán lẻ</span>
          </Navbar.Brand>
          
          <div className="header-search-mobile d-lg-none">
            <Button 
              variant="link" 
              className="search-toggle"
              onClick={() => document.getElementById('search-form-mobile').classList.toggle('active')}
            >
              <FaSearch />
            </Button>
            <Form 
              id="search-form-mobile" 
              className="search-form-mobile" 
              onSubmit={handleSearch}
            >
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary" type="submit">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Form>
          </div>
          
          <div className="header-icons-mobile d-lg-none">
            {isAuthenticated && (
              <Link to="/wishlist" className="icon-link">
                <FaRegHeart />
              </Link>
            )}
            <a href="#" className="icon-link cart-icon" onClick={openCartDrawer}>
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <Badge pill bg="primary" className="cart-badge">
                  {cartItemCount}
                </Badge>
              )}
            </a>
          </div>
          
          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            onClick={toggleNav}
            className="navbar-toggler-custom"
          >
            <FaBars />
          </Navbar.Toggle>
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Form 
              className="d-none d-lg-flex search-form mx-lg-4" 
              onSubmit={handleSearch}
            >
              <InputGroup>
              <Form.Control
                type="search"
                  placeholder="Tìm kiếm ở đây ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
              />
                <Button variant="primary" type="submit" className="search-button">
                <FaSearch />
              </Button>
              </InputGroup>
            </Form>
            
            <Nav className="categories-nav me-auto">
              <Nav.Link 
                as={Link} 
                to="/deal-hot" 
                className={`deal-hot-link ${isActive('/deal-hot') ? 'active' : ''}`}
              >
                Deal Hot
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/category/sua" 
                className={isActive('/category/sua') ? 'active' : ''}
              >
                Sữa các loại
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/category/electronics" 
                className={isActive('/category/electronics') ? 'active' : ''}
              >
                Điện tử
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/category/banhkeo" 
                className={isActive('/category/banhkeo') ? 'active' : ''}
              >
                Bánh Kẹo
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/category/hoapham" 
                className={isActive('/category/hoapham') ? 'active' : ''}
              >
                Hóa phẩm
              </Nav.Link>
            
                  <NavDropdown title="Xem thêm" id="more-dropdown">
                    <NavDropdown.Item as={Link} to="/category/vanphongphamdochoi">Văn phòng phẩm - Đồ chơi</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/category/raucutraicay">Rau - Củ - Quả</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/category/douonggiaikhat">Đồ uống - Giải khát</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/category/mithucphamanlien">Mì - Thực Phẩm Ăn Liền</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/category/chamsoccanhan">Chăm sóc cá nhân</NavDropdown.Item>
                  </NavDropdown>
                
            </Nav>
            
            <Nav className="user-nav d-none d-lg-flex">
              {isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/wishlist" className="icon-link">
                    <FaHeart />
                    <span className="icon-text">Yêu thích</span>
                  </Nav.Link>
                  
                  <Nav.Link as={Link} to="/notifications" className="icon-link">
                    <FaBell />
                    <span className="icon-text">Thông báo</span>
                  </Nav.Link>
                  
                  <Nav.Link 
                    href="#" 
                    className="icon-link" 
                    onClick={openAccountDrawer}
                  >
                    <FaUser className="user-icon" />
                    <span className="icon-text">Tài khoản</span>
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link href="#" className="signin-link" onClick={openAccountDrawer}>Đăng nhập</Nav.Link>
              )}
              
              <Nav.Link 
                href="#" 
                className="icon-link cart-icon"
                onClick={openCartDrawer}
              >
                <FaShoppingCart />
                <span className="icon-text">Giỏ hàng</span>
                {cartItemCount > 0 && (
                  <Badge pill bg="primary" className="cart-badge">
                    {cartItemCount}
                  </Badge>
                )}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* Mobile Category Menu */}
      <div className="mobile-category-menu d-lg-none">
        <Container>
          <Nav className="scrollable-nav">
            <Nav.Link as={Link} to="/deal-hot" className={`${isActive('/deal-hot') ? 'active' : ''} deal-hot-mobile`}>Deal Hot</Nav.Link>
            <Nav.Link as={Link} to="/category/sua" className={isActive('/category/sua') ? 'active' : ''}>Sữa</Nav.Link>
            <Nav.Link as={Link} to="/category/raucutraicay" className={isActive('/category/raucutraicay') ? 'active' : ''}>Rau - củ - quả</Nav.Link>
            <Nav.Link as={Link} to="/category/hoapham" className={isActive('/category/hoapham') ? 'active' : ''}>Hóa phẩm</Nav.Link>
            <Nav.Link as={Link} to="/category/electronics" className={isActive('/category/electronics') ? 'active' : ''}>Điện tử</Nav.Link>
            <Nav.Link as={Link} to="/category/beauty" className={isActive('/category/beauty') ? 'active' : ''}>Beauty</Nav.Link>
            <Nav.Link as={Link} to="/category/books" className={isActive('/category/books') ? 'active' : ''}>Books</Nav.Link>
          </Nav>
        </Container>
      </div>
    </header>
  );
};

export default Header; 