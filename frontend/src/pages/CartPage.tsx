import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
  fetchCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCartItems,
  updateQuantityLocally,
  initializeCart,
} from '../redux/slices/cartSlice';
import {
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
  IconButton,
  TextField,
  Stack,
  List,
  ListItem,
  ListItemText,
  Card,
  CardMedia,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  AddCircleOutline,
  RemoveCircleOutline,
  DeleteOutline,
  ShoppingCart,
  ArrowBack,
  Warning,
} from '@mui/icons-material';
import Loader from '../components/layout/Loader';
import Message from '../components/layout/Message';

// Define types for cart items
interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  loadingItems: { [key: string]: boolean };
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { cartItems, loading, error, loadingItems } = useSelector((state: RootState) => state.cart);
  const { userInfo } = useSelector((state: RootState) => state.user);
  
  // State để theo dõi các sản phẩm đang được cập nhật
  const [updatingItems, setUpdatingItems] = useState<{ [key: string]: boolean }>({});
  
  // State cho thông báo
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>('info');
  
  // State để theo dõi nếu giỏ hàng đang dùng từ local storage
  const [isUsingLocalCart, setIsUsingLocalCart] = useState(false);
  
  // Thêm state cho thông tin giao hàng nhanh
  const [openGuestDialog, setOpenGuestDialog] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    // Đảm bảo giỏ hàng được khởi tạo khi trang được tải
    console.log('CartPage - Initializing cart');
    
    // Kiểm tra giỏ hàng local trước khi gọi API
    const localCart = localStorage.getItem('localCart');
    if (localCart) {
      try {
        const parsedCart = JSON.parse(localCart);
        console.log('CartPage - Found local cart in localStorage:', parsedCart);
      } catch (error) {
        console.error('CartPage - Error parsing local cart:', error);
      }
    } else {
      console.log('CartPage - No local cart found in localStorage');
    }
    
    // Kiểm tra người dùng đã đăng nhập chưa
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        console.log('CartPage - User is logged in:', !!userInfo.token);
      } catch (error) {
        console.error('CartPage - Error parsing userInfo:', error);
      }
    } else {
      console.log('CartPage - User is not logged in');
    }
    
    // Khởi tạo giỏ hàng từ cả API và localStorage
    dispatch(initializeCart())
      .then((result: any) => {
        console.log('CartPage - Cart initialized successfully:', result);
        
        // Kiểm tra nếu kết quả là từ localStorage
        if (result.payload && 
            (!result.meta || 
             !result.meta.requestStatus || 
             result.meta.requestStatus === 'rejected' || 
             result.meta.arg === 'local')) {
          console.log('CartPage - Using local cart data');
          setIsUsingLocalCart(true);
          setAlertMessage('Đang hiển thị giỏ hàng từ bộ nhớ cục bộ. Một số tính năng có thể bị hạn chế.');
          setAlertSeverity('warning');
          setAlertOpen(true);
        }
      })
      .catch((error: any) => {
        console.error('CartPage - Failed to initialize cart:', error);
        setAlertMessage('Không thể kết nối đến máy chủ. Đang hiển thị giỏ hàng từ bộ nhớ cục bộ.');
        setAlertSeverity('error');
        setAlertOpen(true);
        setIsUsingLocalCart(true);
      });
  }, [dispatch]);

  const handleRemoveItem = (productId: string | undefined) => {
    // Validate productId
    if (!productId) {
      console.error('CartPage - Cannot remove item: productId is undefined');
      setAlertMessage('Không thể xóa sản phẩm: ID sản phẩm không hợp lệ');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    
    if (isUsingLocalCart) {
      // Xóa sản phẩm khỏi local cart
      try {
        const localCartStr = localStorage.getItem('localCart');
        if (localCartStr) {
          const localCart = JSON.parse(localCartStr);
          if (localCart && localCart.items) {
            const updatedItems = localCart.items.filter((item: any) => 
              item.product._id !== productId
            );
            localStorage.setItem('localCart', JSON.stringify({ items: updatedItems }));
            
            // Cập nhật UI
            // Sử dụng action mặc định để cập nhật UI thay vì gọi API
            dispatch(removeItemFromCart(productId));
          }
        }
      } catch (error) {
        console.error('CartPage - Error removing item from local cart:', error);
        setAlertMessage('Không thể xóa sản phẩm khỏi giỏ hàng.');
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    } else {
      // Gọi API để xóa sản phẩm
      dispatch(removeItemFromCart(productId))
        .catch((error) => {
          console.error('CartPage - Error removing item:', error);
          setAlertMessage('Không thể xóa sản phẩm. Đang sử dụng giỏ hàng cục bộ.');
          setAlertSeverity('warning');
          setAlertOpen(true);
          setIsUsingLocalCart(true);
        });
    }
  };

  const handleUpdateQuantity = (productId: string | undefined, quantity: number, stockLimit?: number) => {
    // Validate productId
    if (!productId) {
      console.error('CartPage - Cannot update quantity: productId is undefined');
      setAlertMessage('Không thể cập nhật số lượng: ID sản phẩm không hợp lệ');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    
    // Đảm bảo quantity là một số hợp lệ
    const safeQuantity = Number.isNaN(quantity) ? 1 : Math.max(1, Math.round(quantity));
    
    // If a stock limit is provided, enforce it
    if (stockLimit !== undefined && typeof stockLimit === 'number') {
      if (safeQuantity > stockLimit) {
        console.warn('CartPage - Quantity adjusted to stock limit:', { requested: safeQuantity, stockLimit });
        setAlertMessage(`Số lượng không thể vượt quá ${stockLimit} (tồn kho)`);
        setAlertSeverity('warning');
        setAlertOpen(true);
        return;
      }
    }
    
    if (safeQuantity >= 1) {
      console.log('CartPage - Updating quantity:', { productId, quantity: safeQuantity });
      
      // Đánh dấu sản phẩm này đang được cập nhật ngay lập tức
      setUpdatingItems(prev => ({ ...prev, [productId]: true }));
      
      // Cập nhật số lượng ở local để phản hồi UI ngay lập tức
      dispatch(updateQuantityLocally({ productId, quantity: safeQuantity }));
      
      // Gọi API ngay lập tức thay vì delay qua debounce
      dispatch(updateCartItemQuantity({ productId, quantity: safeQuantity }))
        .catch((error) => {
          console.error('CartPage - Error updating quantity:', error);
          setAlertMessage('Không thể cập nhật số lượng. Đang sử dụng giỏ hàng cục bộ.');
          setAlertSeverity('warning');
          setAlertOpen(true);
          setIsUsingLocalCart(true);
        })
        .finally(() => {
          // Gỡ bỏ đánh dấu cập nhật khi hoàn thành bất kể thành công hay thất bại
          setUpdatingItems(prev => ({ ...prev, [productId]: false }));
        });
    }
  };

  const handleClearCart = () => {
    if (isUsingLocalCart) {
      // Xóa giỏ hàng trong localStorage
      localStorage.removeItem('localCart');
      // Cập nhật UI
      dispatch(clearCartItems());
    } else {
      // Gọi API để xóa giỏ hàng
      dispatch(clearCartItems())
        .catch(() => {
          setAlertMessage('Không thể xóa giỏ hàng. Đang sử dụng giỏ hàng cục bộ.');
          setAlertSeverity('warning');
          setAlertOpen(true);
          setIsUsingLocalCart(true);
        });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    // Kiểm tra giỏ hàng trống
    if (cartItems.length === 0) {
      setAlertMessage('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }
    
    // Kiểm tra người dùng đã đăng nhập chưa
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      console.log('CartPage - User not logged in, opening quick checkout dialog');
      setOpenGuestDialog(true);
      return;
    }
    
    // Người dùng đã đăng nhập, chuyển đến trang thanh toán
    navigate('/shipping');
  };
  
  // Xử lý khi khách xác nhận đặt hàng nhanh
  const handleGuestCheckout = () => {
    // Reset lỗi
    const errors = {
      name: '',
      email: '',
      phone: '',
      address: ''
    };
    let hasError = false;
    
    // Validate name
    if (!guestName) {
      errors.name = 'Vui lòng nhập họ tên';
      hasError = true;
    }
    
    // Validate email
    if (!guestEmail) {
      errors.email = 'Vui lòng nhập email';
      hasError = true;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(guestEmail)) {
        errors.email = 'Email không hợp lệ';
        hasError = true;
      }
    }
    
    // Validate phone
    if (!guestPhone) {
      errors.phone = 'Vui lòng nhập số điện thoại';
      hasError = true;
    } else {
      const phonePattern = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phonePattern.test(guestPhone)) {
        errors.phone = 'Số điện thoại không hợp lệ';
        hasError = true;
      }
    }
    
    // Validate address
    if (!guestAddress) {
      errors.address = 'Vui lòng nhập địa chỉ giao hàng';
      hasError = true;
    }
    
    // Nếu có lỗi, hiển thị và dừng lại
    if (hasError) {
      setFormErrors(errors);
      return;
    }
    
    // Bắt đầu xử lý đơn hàng
    setIsProcessingOrder(true);
    
    // Lưu thông tin vào localStorage
    localStorage.setItem('guestEmail', guestEmail);
    
    // Lưu thông tin giao hàng
    const shippingAddress = {
      fullName: guestName,
      address: guestAddress,
      city: 'Hà Nội',
      district: 'Hà Nội',
      province: 'Hà Nội',
      postalCode: '100000',
      country: 'Vietnam',
      phoneNumber: guestPhone
    };
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    
    // Lưu phương thức thanh toán mặc định
    localStorage.setItem('paymentMethod', 'cod');
    
    // Hiển thị thông báo đang xử lý
    setAlertMessage('Đang xử lý đơn hàng của bạn, vui lòng đợi...');
    setAlertSeverity('info');
    setAlertOpen(true);
    
    // Đóng dialog và chuyển đến trang xác nhận đơn hàng (dùng setTimeout để đảm bảo người dùng thấy loading)
    setTimeout(() => {
      setOpenGuestDialog(false);
      navigate('/placeorder');
    }, 1000);
  };
  
  // Xử lý khi khách đóng dialog
  const handleCloseGuestDialog = () => {
    setOpenGuestDialog(false);
    setFormErrors({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
  };
  
  // Kiểm tra xem sản phẩm có đang được cập nhật không (từ store hoặc state local)
  const isItemUpdating = (productId: string) => {
    return Boolean(updatingItems[productId] || loadingItems?.[productId]);
  };
  
  // Xử lý đóng thông báo
  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  // Debug info
  console.log('CartPage - Current cartItems:', cartItems);
  console.log('CartPage - Items count:', cartItems.length);
  console.log('CartPage - Using local cart:', isUsingLocalCart);
  
  // Debug first cart item if exists
  if (cartItems.length > 0) {
    console.log('CartPage - First item structure:', JSON.stringify(cartItems[0], null, 2));
  }

  return (
    <Box sx={{ my: 4, px: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Giỏ hàng
      </Typography>
      
      {isUsingLocalCart && (
        <Alert 
          severity="warning" 
          icon={<Warning />}
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => {
                setAlertMessage('Đang thử kết nối lại với máy chủ...');
                setAlertSeverity('info');
                setAlertOpen(true);
                
                // Thử kết nối lại với API
                dispatch(initializeCart())
                  .then((result: any) => {
                    if (result.payload && result.meta && result.meta.requestStatus === 'fulfilled') {
                      setIsUsingLocalCart(false);
                      setAlertMessage('Đã kết nối lại thành công với máy chủ!');
                      setAlertSeverity('success');
                    } else {
                      setAlertMessage('Không thể kết nối với máy chủ. Vẫn đang sử dụng giỏ hàng cục bộ.');
                      setAlertSeverity('error');
                    }
                    setAlertOpen(true);
                  })
                  .catch(() => {
                    setAlertMessage('Không thể kết nối với máy chủ. Vẫn đang sử dụng giỏ hàng cục bộ.');
                    setAlertSeverity('error');
                    setAlertOpen(true);
                  });
              }}
            >
              Thử lại
            </Button>
          }
        >
          Đang hiển thị giỏ hàng từ bộ nhớ cục bộ do không thể kết nối với máy chủ. 
          Một số tính năng có thể bị hạn chế.
        </Alert>
      )}

      {loading && cartItems.length === 0 ? (
        <Loader />
      ) : error ? (
        <Message severity="error">{error}</Message>
      ) : cartItems.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Tiếp tục mua sắm
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Sản phẩm ({cartItems.reduce((acc: number, item: CartItem) => acc + item.quantity, 0)})
                </Typography>
                <Button
                  size="small"
                  startIcon={<DeleteOutline />}
                  onClick={handleClearCart}
                  color="error"
                >
                  Xóa tất cả
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <List>
                {cartItems.map((item: CartItem) => (
                  <React.Fragment key={item.product._id}>
                    <ListItem sx={{ py: 2, px: 0 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={2}>
                          <Card elevation={0}>
                            <CardMedia
                              component="img"
                              image={item.product.image || 'https://placehold.co/100x100?text=No+Image'}
                              alt={item.product.name}
                              sx={{ height: '80px', objectFit: 'contain' }}
                            />
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <ListItemText
                            primary={
                              <Typography
                                component={RouterLink}
                                to={`/product/${item.product._id}`}
                                color="inherit"
                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                              >
                                {item.product.name}
                              </Typography>
                            }
                            secondary={`Đơn giá: ${new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(item.product.price)}`}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                if (!item.product || !item.product._id) {
                                  console.error('CartPage - Cannot update: invalid product', item);
                                  setAlertMessage('Không thể cập nhật: sản phẩm không hợp lệ');
                                  setAlertSeverity('error');
                                  setAlertOpen(true);
                                  return;
                                }
                                
                                const newQuantity = item.quantity - 1;
                                if (newQuantity >= 1) {
                                  // Pass the stock limit for consistency
                                  const stockLimit = item.product && typeof item.product.stock === 'number' ? item.product.stock : undefined;
                                  handleUpdateQuantity(item.product._id, newQuantity, stockLimit);
                                } else {
                                  setAlertMessage('Số lượng không thể nhỏ hơn 1');
                                  setAlertSeverity('warning');
                                  setAlertOpen(true);
                                }
                              }}
                              disabled={
                                item.quantity <= 1 ||
                                updatingItems[item.product?._id || ''] ||
                                !item.product ||
                                !item.product._id
                              }
                            >
                              <RemoveCircleOutline />
                            </IconButton>
                            <TextField
                              variant="outlined"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => {
                                if (!item.product || !item.product._id) {
                                  console.error('CartPage - Cannot update: invalid product', item);
                                  setAlertMessage('Không thể cập nhật: sản phẩm không hợp lệ');
                                  setAlertSeverity('error');
                                  setAlertOpen(true);
                                  return;
                                }
                                
                                const val = parseInt(e.target.value);
                                const stockLimit = item.product && typeof item.product.stock === 'number' ? item.product.stock : undefined;
                                
                                handleUpdateQuantity(item.product._id, val, stockLimit);
                              }}
                              inputProps={{
                                min: 1,
                                max: item.product && typeof item.product.stock === 'number' ? item.product.stock : 1,
                                style: { textAlign: 'center' },
                                type: 'number',
                              }}
                              sx={{ width: '70px', mx: 1 }}
                              disabled={updatingItems[item.product?._id || ''] || !item.product || !item.product._id}
                            />
                            <IconButton
                              color="primary"
                              onClick={() => {
                                if (!item.product || !item.product._id) {
                                  console.error('CartPage - Cannot update: invalid product', item);
                                  setAlertMessage('Không thể cập nhật: sản phẩm không hợp lệ');
                                  setAlertSeverity('error');
                                  setAlertOpen(true);
                                  return;
                                }
                                
                                if (!item.product.stock || typeof item.product.stock !== 'number') {
                                  console.warn('CartPage - Product has invalid stock value:', item.product);
                                  setAlertMessage('Không thể cập nhật: thông tin tồn kho không hợp lệ');
                                  setAlertSeverity('warning');
                                  setAlertOpen(true);
                                  return;
                                }
                                
                                const newQuantity = item.quantity + 1;
                                handleUpdateQuantity(item.product._id, newQuantity, item.product.stock);
                              }}
                              disabled={
                                (item.product?.stock !== undefined && item.quantity >= item.product.stock) ||
                                updatingItems[item.product?._id || ''] ||
                                !item.product ||
                                !item.product._id
                              }
                            >
                              <AddCircleOutline />
                            </IconButton>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(item.product.price * item.quantity)}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                // Enhanced validation for product structure
                                if (!item || !item.product || typeof item.product !== 'object') {
                                  console.error('CartPage - Cannot remove: product is missing or invalid', item);
                                  setAlertMessage('Không thể xóa: sản phẩm không hợp lệ');
                                  setAlertSeverity('error');
                                  setAlertOpen(true);
                                  return;
                                }
                                
                                // Validate product properties
                                if (!item.product._id) {
                                  console.error('CartPage - Cannot remove: product ID is missing', item.product);
                                  setAlertMessage('Không thể xóa: ID sản phẩm bị thiếu');
                                  setAlertSeverity('error');
                                  setAlertOpen(true);
                                  return;
                                }
                                
                                handleRemoveItem(item.product._id);
                              }}
                              disabled={isItemUpdating(item.product._id)}
                            >
                              <DeleteOutline />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tổng tiền
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem sx={{ py: 1 }}>
                  <ListItemText primary="Tạm tính" />
                  <Typography variant="body1">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(calculateTotal())}
                  </Typography>
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemText primary="Phí vận chuyển" />
                  <Typography variant="body1">
                    {calculateTotal() > 500000
                      ? 'Miễn phí'
                      : new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(30000)}
                  </Typography>
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem sx={{ py: 1 }}>
                  <ListItemText
                    primary="Tổng cộng"
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(calculateTotal() + (calculateTotal() > 500000 ? 0 : 30000))}
                  </Typography>
                </ListItem>
              </List>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleCheckout}
                sx={{ mt: 2 }}
                disabled={loading || cartItems.length === 0}
              >
                Tiến hành đặt hàng
              </Button>
              <Button
                component={RouterLink}
                to="/"
                startIcon={<ArrowBack />}
                sx={{ mt: 2 }}
                fullWidth
              >
                Tiếp tục mua sắm
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Thêm snackbar để hiển thị thông báo */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Dialog yêu cầu thông tin cho khách không đăng nhập */}
      <Dialog open={openGuestDialog} onClose={handleCloseGuestDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Đặt hàng nhanh không cần đăng nhập</DialogTitle>
        <DialogContent>
          {isProcessingOrder ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                Đang xử lý đơn hàng của bạn
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary">
                Vui lòng đợi trong giây lát...
              </Typography>
            </Box>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Vui lòng nhập thông tin để chúng tôi có thể giao hàng cho bạn.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Họ tên"
                fullWidth
                variant="outlined"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Số điện thoại"
                fullWidth
                variant="outlined"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Địa chỉ giao hàng"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={guestAddress}
                onChange={(e) => setGuestAddress(e.target.value)}
                error={!!formErrors.address}
                helperText={formErrors.address}
                sx={{ mb: 1 }}
              />
              <Alert severity="info" sx={{ mt: 1 }}>
                Đơn hàng sẽ được thanh toán bằng tiền mặt khi nhận hàng (COD).
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!isProcessingOrder && (
            <>
              <Button onClick={handleCloseGuestDialog} color="primary">
                Hủy
              </Button>
              <Button onClick={handleGuestCheckout} color="primary" variant="contained">
                Đặt hàng ngay
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CartPage; 