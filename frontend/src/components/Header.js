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
  
  // Handle scroll event to add shadow to header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="topbar-links">
              <a href="/track-order">Track Order</a>
              <a href="/help">Help & FAQs</a>
              {isAuthenticated ? (
                <a href="#" onClick={openAccountDrawer} className="welcome-message">Welcome, {user?.name?.split(' ')[0] || 'User'}</a>
              ) : (
                <a href="#" onClick={openAccountDrawer}>Sign In / Register</a>
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
            <span className="brand-tagline">Premium Retail</span>
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
                  placeholder="Search for products, brands and more..."
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
                to="/category/electronics" 
                className={isActive('/category/electronics') ? 'active' : ''}
              >
                  Electronics
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/category/fashion" 
                className={isActive('/category/fashion') ? 'active' : ''}
              >
                Fashion
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/category/home" 
                className={isActive('/category/home') ? 'active' : ''}
              >
                Home
              </Nav.Link>
                <Nav.Link 
                as={Link} 
                to="/category/beauty" 
                className={isActive('/category/beauty') ? 'active' : ''}
                >
                Beauty
                </Nav.Link>
              <NavDropdown title="More" id="more-dropdown">
                <NavDropdown.Item as={Link} to="/category/books">Books</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/category/sports">Sports</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/category/toys">Toys & Games</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/category/groceries">Groceries</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            
            <Nav className="user-nav d-none d-lg-flex">
              {isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/wishlist" className="icon-link">
                    <FaHeart />
                    <span className="icon-text">Wishlist</span>
                  </Nav.Link>
                  
                  <Nav.Link as={Link} to="/notifications" className="icon-link">
                    <FaBell />
                    <span className="icon-text">Notifications</span>
                  </Nav.Link>
                  
                  <Nav.Link 
                    href="#" 
                    className="icon-link" 
                    onClick={openAccountDrawer}
                  >
                    <FaUser className="user-icon" />
                    <span className="icon-text">Account</span>
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link href="#" className="signin-link" onClick={openAccountDrawer}>Sign In</Nav.Link>
              )}
              
              <Nav.Link 
                href="#" 
                className="icon-link cart-icon"
                onClick={openCartDrawer}
              >
                <FaShoppingCart />
                <span className="icon-text">Cart</span>
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
            <Nav.Link as={Link} to="/category/electronics" className={isActive('/category/electronics') ? 'active' : ''}>Electronics</Nav.Link>
            <Nav.Link as={Link} to="/category/fashion" className={isActive('/category/fashion') ? 'active' : ''}>Fashion</Nav.Link>
            <Nav.Link as={Link} to="/category/home" className={isActive('/category/home') ? 'active' : ''}>Home</Nav.Link>
            <Nav.Link as={Link} to="/category/beauty" className={isActive('/category/beauty') ? 'active' : ''}>Beauty</Nav.Link>
            <Nav.Link as={Link} to="/category/books" className={isActive('/category/books') ? 'active' : ''}>Books</Nav.Link>
            <Nav.Link as={Link} to="/category/sports" className={isActive('/category/sports') ? 'active' : ''}>Sports</Nav.Link>
            <Nav.Link as={Link} to="/category/toys" className={isActive('/category/toys') ? 'active' : ''}>Toys</Nav.Link>
            <Nav.Link as={Link} to="/category/groceries" className={isActive('/category/groceries') ? 'active' : ''}>Groceries</Nav.Link>
          </Nav>
        </Container>
      </div>
    </header>
  );
};

export default Header; 