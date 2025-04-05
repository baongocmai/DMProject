import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/userSlice';
import { RootState, AppDispatch } from '../../redux/store';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Stack,
  SvgIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Person,
  DeleteOutline,
} from '@mui/icons-material';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElCart, setAnchorElCart] = useState<null | HTMLElement>(null);

  // Get user info from Redux
  const { userInfo } = useSelector((state: RootState) => state.user);
  
  // Get cart info from Redux
  const { cartItems } = useSelector((state: RootState) => state.cart);

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Tính tổng giá trị giỏ hàng
  const totalPrice = cartItems.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleOpenCartMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCart(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleCloseCartMenu = () => {
    setAnchorElCart(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleCloseUserMenu();
  };
  
  const handleGoToCart = () => {
    navigate('/cart');
    handleCloseCartMenu();
  };

  // Mini cart preview
  const renderMiniCart = () => (
    <Paper sx={{ maxWidth: 360, maxHeight: 400, overflow: 'auto' }}>
      <List sx={{ width: '100%', minWidth: 300 }}>
        {cartItems.length === 0 ? (
          <ListItem>
            <ListItemText primary="Giỏ hàng trống" />
          </ListItem>
        ) : (
          <>
            {cartItems.slice(0, 3).map((item) => (
              <React.Fragment key={item.product._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar alt={item.product.name} src={item.product.image} variant="square" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.product.name}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.product.price)} x {item.quantity}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
            
            {cartItems.length > 3 && (
              <ListItem>
                <ListItemText 
                  primary={`... và ${cartItems.length - 3} sản phẩm khác`} 
                  sx={{ textAlign: 'center', fontStyle: 'italic' }}
                />
              </ListItem>
            )}
            
            <Divider />
            <ListItem>
              <ListItemText 
                primary={`Tổng cộng: ${new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(totalPrice)}`}
                sx={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <ListItem>
              <Button 
                variant="contained" 
                fullWidth 
                color="primary"
                onClick={handleGoToCart}
              >
                Xem giỏ hàng
              </Button>
            </ListItem>
          </>
        )}
      </List>
    </Paper>
  );

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg,rgb(119, 23, 44) 0%,rgb(124, 26, 45) 50%,rgb(179, 50, 76) 100%)', 
      boxShadow: '0 4px 12px rgba(206, 38, 71, 0.3)' 
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Box
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
            }}
          >
            <RouterLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  mr: 1, 
                  height: 80, 
                  width: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <img src="/logo512.png" alt="2NADH Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    height: '30%', 
                    width: '30%',
                  }}
                >
                  <img src="/logo192.png" alt="2NADH Small Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                </Box>
              </Box>
              <Stack>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.7rem',
                    letterSpacing: '.05rem',
                    fontWeight: 300,
                  }}
                >
                  MUA SẮM THÔNG MINH
                </Typography>
              </Stack>
            </RouterLink>
          </Box>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/'); }}>
                <Typography textAlign="center">Trang chủ</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/products'); }}>
                <Typography textAlign="center">Sản phẩm</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/contact'); }}>
                <Typography textAlign="center">Liên hệ</Typography>
              </MenuItem>
            </Menu>
          </Box>
          
          {/* Logo - Mobile */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <RouterLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  mr: 1, 
                  height: 55, 
                  width: 55,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <img src="/logo512.png" alt="2NADH Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    height: '30%', 
                    width: '30%',
                  }}
                >
                  <img src="/logo192.png" alt="2NADH Small Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                </Box>
              </Box>
            </RouterLink>
          </Box>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              component={RouterLink}
              to="/"
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Trang chủ
            </Button>
          </Box>

          {/* Cart icon */}
          <Box sx={{ mr: 2 }}>
            <Tooltip title="Giỏ hàng">
              <IconButton 
                color="inherit"
                aria-label="cart"
                onClick={handleOpenCartMenu}
                aria-controls="cart-menu"
                aria-haspopup="true"
              >
                <Badge badgeContent={totalItems} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </Tooltip>
            <Popover
              id="cart-menu"
              anchorEl={anchorElCart}
              open={Boolean(anchorElCart)}
              onClose={handleCloseCartMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {renderMiniCart()}
            </Popover>
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {userInfo ? (
              <>
                <Tooltip title="Mở menu">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={userInfo.name?.charAt(0).toUpperCase()} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem 
                    onClick={handleCloseUserMenu}
                    component={RouterLink}
                    to="/profile"
                  >
                    <Typography textAlign="center">Tài khoản</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleCloseUserMenu}
                    component={RouterLink}
                    to="/orders"
                  >
                    <Typography textAlign="center">Đơn hàng</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Đăng xuất</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                startIcon={<Person />}
              >
                Đăng nhập
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 