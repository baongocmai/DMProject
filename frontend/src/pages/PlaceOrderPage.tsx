import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { createOrder } from '../redux/slices/orderSlice';
import {
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardMedia,
  Step,
  StepLabel,
  Stepper,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalShipping,
  Payment,
  Person,
  ShoppingBag,
} from '@mui/icons-material';
import Loader from '../components/layout/Loader';
import Message from '../components/layout/Message';

// Styled components
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const SectionIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1, 0),
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  minWidth: 120,
}));

const InfoValue = styled(Typography)({
  color: 'text.secondary',
  flex: 1,
});

// Interface for cart and order types
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

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phoneNumber: string;
  district?: string;
  country?: string;
}

interface CartState {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  loading: boolean;
  error: string | null;
}

interface OrderState {
  order: any;
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Checkout steps
const steps = ['Giỏ hàng', 'Thông tin giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

// Payment method display names
const paymentMethodNames: {[key: string]: string} = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  banking: 'Chuyển khoản ngân hàng',
  credit_card: 'Thẻ tín dụng / Ghi nợ',
};

// Interface để định nghĩa đúng kiểu dữ liệu
interface ShippingAddressType {
  fullName: string;
  address: string;
  city: string;
  district?: string;
  province?: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

interface CartItemType {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

const PlaceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [isFakeOrder, setIsFakeOrder] = useState(false);
  // State cho thông báo
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Thêm state để theo dõi trạng thái tự động đặt hàng
  const [autoOrdering, setAutoOrdering] = useState(false);
  
  // Hàm hiển thị thông báo
  const showAlert = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Get cart state from Redux
  const cart = useSelector((state: RootState) => state.cart as CartState);
  const { shippingAddress, paymentMethod, cartItems } = cart;
  
  // Get order state from Redux
  const orderCreate = useSelector((state: RootState) => state.order as OrderState);
  const { loading, success, error, order } = orderCreate;
  
  // Calculate prices
  const itemsPrice = cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.product.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice > 500000 ? 0 : 30000; // Free shipping for orders over 500,000 VND
  const taxPrice = 0; // No tax applied
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Effect to check if order was created successfully
  useEffect(() => {
    // Kiểm tra nếu là khách không đăng nhập và có địa chỉ giao hàng
    const userInfoStr = localStorage.getItem('userInfo');
    const guestEmail = localStorage.getItem('guestEmail');
    const isGuest = !userInfoStr && guestEmail;
    
    // Cập nhật state để hiển thị loading nếu là khách
    if (isGuest) {
      setAutoOrdering(true);
    }
    
    // Redirect if not shipping address or payment method
    if (!shippingAddress) {
      navigate('/shipping');
      return;
    } else if (!paymentMethod) {
      navigate('/payment');
      return;
    }
    
    // Nếu là khách không đăng nhập và trang vừa mới tải, tự động đặt hàng
    if (isGuest && !loading && !success && !error && !autoOrdering) {
      console.log('Guest checkout detected, auto-submitting order...');
      // Hiển thị thông báo
      showAlert('Đang xử lý đơn hàng của bạn...', 'info');
      setAutoOrdering(true);
      
      // Dùng setTimeout để đảm bảo component đã render hoàn toàn
      setTimeout(() => {
        handleSubmit();
      }, 500);
    }
    
    // Nếu đặt hàng thành công
    if (success) {
      console.log('Order placed successfully, checking order format:', order);
      setAutoOrdering(false);
      
      // Kiểm tra định dạng response để xử lý đúng
      if (order) {
        let orderId;
        let isFake = false;
        
        // Kiểm tra các định dạng phản hồi có thể có
        if (order._id) {
          // Định dạng thông thường
          orderId = order._id;
          isFake = orderId.toString().startsWith('fake_order_');
        } else if (order.order && order.order._id) {
          // Định dạng { message, order } từ backend response
          orderId = order.order._id;
          isFake = orderId.toString().startsWith('fake_order_');
        }
        
        if (orderId) {
          // Đặt trạng thái đơn hàng giả/thật
          setIsFakeOrder(isFake);
          
          // Hiển thị thông báo phù hợp
          if (isFake) {
            showAlert('Đơn hàng đã được tạo ở CHẾ ĐỘ THỬ NGHIỆM (không có kết nối đến database). Đơn hàng này sẽ không được lưu trữ. Đây chỉ là chức năng demo.', 'warning');
          } else {
            showAlert('Đặt hàng thành công!', 'success');
          }
          
          // Điều hướng đến trang chi tiết đơn hàng
          navigate(`/order/${orderId}`);
        } else {
          console.error('Invalid order format:', order);
          showAlert('Đã tạo đơn hàng nhưng không lấy được mã đơn hàng', 'warning');
        }
      }
    }
    
    // Nếu có lỗi, reset trạng thái tự động đặt hàng
    if (error) {
      setAutoOrdering(false);
    }
  }, [navigate, shippingAddress, paymentMethod, success, order, loading, error, autoOrdering]);

  // Kiểm tra lại một lần nữa để tránh lỗi rendering
  if (!shippingAddress) {
    return <Loader />;
  }

  const handleSubmit = () => {
    try {
      console.log('Submitting order, checking cart is not empty...');
      if (cartItems.length === 0) {
        showAlert('Giỏ hàng trống!', 'error');
        return;
      }
      
      console.log('Getting shipping address from localStorage...');
      // Lấy shippingAddress từ localStorage
      const userInfoStr = localStorage.getItem('userInfo');
      const isGuest = !userInfoStr;
      
      // Kiểm tra xem có phải khách vãng lai không
      if (isGuest) {
        console.log('Guest checkout detected, proceeding with guest info');
        
        // Lấy địa chỉ giao hàng từ localStorage
        const shippingAddressJSON = localStorage.getItem('shippingAddress');
        if (!shippingAddressJSON) {
          console.error('No shipping address found');
          showAlert('Bạn cần nhập địa chỉ giao hàng', 'error');
          navigate('/shipping');
          return;
        }
        
        try {
          const fullShippingAddress = JSON.parse(shippingAddressJSON) as ShippingAddressType;
          console.log('Original shipping address:', fullShippingAddress);
          
          // Format lại địa chỉ chỉ với các trường cần thiết
          const formattedShippingAddress = {
            fullName: fullShippingAddress.fullName || '',
            address: fullShippingAddress.address || '',
            city: fullShippingAddress.city || fullShippingAddress.district || '',
            province: fullShippingAddress.province || '',
            postalCode: fullShippingAddress.postalCode || '000000',
            country: 'Vietnam', // Hardcode country là Vietnam
            phoneNumber: fullShippingAddress.phoneNumber || ''
          };
          
          // Dịch thông tin thành guestInfo
          const guestInfo = {
            name: fullShippingAddress.fullName || '',
            email: localStorage.getItem('guestEmail') || 'guest@example.com',
            phone: fullShippingAddress.phoneNumber || ''
          };
          
          console.log('Using guest checkout with info:', guestInfo);
          
          // Format lại cart items
          const orderItems = cartItems.map(item => ({
            product: item.product._id,
            name: item.product.name || '',
            image: item.product.image || '',
            price: Number(item.product.price) || 0,
            quantity: Number(item.quantity) || 1
          }));
          
          // Dispatch action với dữ liệu khách vãng lai
          console.log('Dispatching createOrder action for guest...');
          dispatch(
            createOrder({
              orderItems,
              shippingAddress: formattedShippingAddress,
              paymentMethod,
              totalPrice,
              guestInfo
            })
          );
        } catch (error) {
          console.error('Error processing shipping address:', error);
          showAlert('Lỗi xử lý địa chỉ giao hàng', 'error');
        }
      } else {
        // Đã đăng nhập, kiểm tra token
        try {
          const userInfo = JSON.parse(userInfoStr);
          if (!userInfo?.token) {
            console.error('No valid token found in userInfo');
            showAlert('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            navigate('/login');
            return;
          }
          console.log('User has valid token:', userInfo.token ? 'Yes' : 'No');
        } catch (error) {
          console.error('Error parsing userInfo:', error);
          showAlert('Lỗi phiên đăng nhập, vui lòng đăng nhập lại', 'error');
          navigate('/login');
          return;
        }
        
        const shippingAddressJSON = localStorage.getItem('shippingAddress');
        if (!shippingAddressJSON) {
          console.error('No shipping address found');
          showAlert('Bạn cần nhập địa chỉ giao hàng', 'error');
          navigate('/shipping');
          return;
        }
        
        try {
          const fullShippingAddress = JSON.parse(shippingAddressJSON) as ShippingAddressType;
          console.log('Original shipping address:', fullShippingAddress);
          
          // Format lại địa chỉ chỉ với các trường cần thiết theo Order schema và đảm bảo đúng kiểu ShippingAddress
          const formattedShippingAddress = {
            fullName: fullShippingAddress.fullName || '',
            address: fullShippingAddress.address || '',
            city: fullShippingAddress.city || fullShippingAddress.district || '',
            province: fullShippingAddress.province || '',
            postalCode: fullShippingAddress.postalCode || '000000',
            country: 'Vietnam', // Hardcode country là Vietnam
            phoneNumber: fullShippingAddress.phoneNumber || ''
          };
          
          console.log('Using formatted shipping address:', formattedShippingAddress);
          
          // Format lại cart items đảm bảo đúng kiểu CartItem
          const orderItems = cartItems.map(item => ({
            product: item.product._id,
            name: item.product.name || '',
            image: item.product.image || '',
            price: Number(item.product.price) || 0,
            quantity: Number(item.quantity) || 1
          }));
          
          console.log('Formatted order items:', orderItems);
          
          // Dispatch action với dữ liệu được format đúng
          console.log('Dispatching createOrder action...');
          dispatch(
            createOrder({
              orderItems,
              shippingAddress: formattedShippingAddress,
              paymentMethod,
              totalPrice
            })
          );
        } catch (error) {
          console.error('Error processing shipping address:', error);
          showAlert('Lỗi xử lý địa chỉ giao hàng', 'error');
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      showAlert(error instanceof Error ? error.message : 'Lỗi đặt hàng', 'error');
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ my: 4 }}>
      {/* Snackbar để hiển thị thông báo */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Thông báo khi đang tự động đặt hàng */}
      {(autoOrdering || loading) ? (
        <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" align="center" gutterBottom>
            Đang xử lý đơn hàng của bạn
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            Vui lòng đợi trong giây lát...
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Thêm cảnh báo cho chế độ development nếu không có kết nối backend */}
          {process.env.NODE_ENV === 'development' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Bạn đang ở chế độ DEVELOPMENT. Nếu không có kết nối đến database, đơn hàng sẽ được tạo ở chế độ giả lập.
            </Alert>
          )}
          
          {isFakeOrder && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Đơn hàng này được tạo ở CHẾ ĐỘ THỬ NGHIỆM và không được lưu vào database. 
              Cần kiểm tra kết nối backend để tạo đơn hàng thật.
            </Alert>
          )}
          
          <Stepper activeStep={3} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {loading ? (
            <Loader />
          ) : error ? (
            <>
              <Message severity="error">
                {error}
              </Message>
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/cart"
                  startIcon={<ShoppingBag />}
                >
                  Quay lại giỏ hàng
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    console.log('Thử lại đặt hàng với dữ liệu:', {
                      shippingAddress: {
                        ...shippingAddress,
                        country: 'Vietnam',
                        city: shippingAddress.district || shippingAddress.city,
                        postalCode: shippingAddress.postalCode || '100000'
                      },
                      paymentMethod,
                      cartItems
                    });
                    handleSubmit();
                  }}
                >
                  Thử lại
                </Button>
              </Box>
              
              <Paper sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Thông tin debug:
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto' }}>
                  API URL: {process.env.REACT_APP_API_URL || 'Không được cấu hình'}<br />
                  Payment Method: {paymentMethod}<br />
                  Shipping Address: {JSON.stringify(shippingAddress)}<br />
                  Auth Status: {(() => {
                    const userInfoStr = localStorage.getItem('userInfo');
                    if (!userInfoStr) return 'Chưa đăng nhập';
                    try {
                      const userInfo = JSON.parse(userInfoStr);
                      return userInfo?.token ? 'Đã đăng nhập (có token)' : 'Đã đăng nhập (không có token)';
                    } catch (err) {
                      return 'Lỗi đọc dữ liệu đăng nhập';
                    }
                  })()}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const directUrls = [
                        'http://localhost:5000/api/orders',
                        'http://localhost:5000/orders',
                        'http://127.0.0.1:5000/api/orders',
                        'http://127.0.0.1:5000/orders'
                      ];
                      
                      // Kiểm tra token trước
                      const userInfoStr = localStorage.getItem('userInfo');
                      let hasToken = false;
                      let token = '';
                      
                      if (userInfoStr) {
                        try {
                          const userInfo = JSON.parse(userInfoStr);
                          token = userInfo?.token || '';
                          hasToken = !!token;
                          
                          if (token) {
                            // Hiển thị thông tin token cho debug
                            const tokenPreview = token.slice(0, 15) + '...' + token.slice(-10);
                            console.log('Token being used:', tokenPreview);
                          }
                        } catch (err) {
                          console.error('Lỗi parsing userInfo:', err);
                        }
                      }
                      
                      if (!hasToken) {
                        alert('Bạn cần đăng nhập lại để tiếp tục. Hệ thống sẽ chuyển hướng đến trang đăng nhập.');
                        navigate('/login?redirect=placeorder');
                        return;
                      }
                      
                      console.log('Thử tạo đơn hàng với các URL trực tiếp');
                      
                      const orderData = {
                        orderItems: cartItems.map(item => ({
                          product: item.product._id,
                          name: item.product.name,
                          image: item.product.image,
                          price: Number(item.product.price),
                          quantity: Number(item.quantity),
                        })),
                        shippingAddress: {
                          ...shippingAddress,
                          country: 'Vietnam',
                          city: shippingAddress.district || shippingAddress.city,
                          postalCode: shippingAddress.postalCode || '100000'
                        },
                        paymentMethod,
                        itemsPrice: Number(itemsPrice),
                        shippingPrice: Number(shippingPrice),
                        taxPrice: Number(taxPrice),
                        totalPrice: Number(totalPrice)
                      };

                      // Thử từng URL
                      directUrls.forEach(async (url) => {
                        try {
                          console.log(`Thử gửi request đến: ${url}`);
                          const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Accept': 'application/json',
                              'Authorization': hasToken ? `Bearer ${token}` : ''
                            },
                            body: JSON.stringify(orderData)
                          });
                          
                          console.log(`Kết quả từ ${url}:`, response.status);
                          if (response.ok) {
                            console.log('Thành công!');
                            alert(`Thành công với URL: ${url}`);
                          } else {
                            if (response.status === 401) {
                              console.log('Lỗi xác thực (401) - Token có thể hết hạn');
                            }
                            console.log('Thất bại với status:', response.status);
                          }
                        } catch (err) {
                          console.error(`Lỗi kết nối đến ${url}:`, err);
                        }
                      });
                    }}
                  >
                    Kiểm tra kết nối trực tiếp
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={() => {
                      navigate('/login?redirect=placeorder');
                    }}
                    sx={{ ml: 2 }}
                  >
                    Đăng nhập lại
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      localStorage.removeItem('userInfo');
                      alert('Đã đăng xuất. Vui lòng đăng nhập lại để tiếp tục.');
                      navigate('/login?redirect=placeorder');
                    }}
                    sx={{ ml: 2 }}
                  >
                    Đăng xuất và đăng nhập lại
                  </Button>
                </Box>
              </Paper>
            </>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SectionIcon>
                      <Person color="primary" />
                    </SectionIcon>
                    <SectionTitle variant="h6">Thông tin giao hàng</SectionTitle>
                  </Box>
                  <Box sx={{ pl: 4 }}>
                    <InfoItem>
                      <InfoLabel variant="body1">Họ tên:</InfoLabel>
                      <InfoValue variant="body1">{shippingAddress.fullName}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel variant="body1">Địa chỉ:</InfoLabel>
                      <InfoValue variant="body1">
                        {shippingAddress.address}, {shippingAddress.district || shippingAddress.city}, {shippingAddress.province}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel variant="body1">Số điện thoại:</InfoLabel>
                      <InfoValue variant="body1">{shippingAddress.phoneNumber}</InfoValue>
                    </InfoItem>
                    <Button
                      component={RouterLink}
                      to="/shipping"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Box>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SectionIcon>
                      <Payment color="primary" />
                    </SectionIcon>
                    <SectionTitle variant="h6">Phương thức thanh toán</SectionTitle>
                  </Box>
                  <Box sx={{ pl: 4 }}>
                    <InfoItem>
                      <InfoLabel variant="body1">Phương thức:</InfoLabel>
                      <InfoValue variant="body1">
                        {paymentMethodNames[paymentMethod] || paymentMethod}
                      </InfoValue>
                    </InfoItem>
                    <Button
                      component={RouterLink}
                      to="/payment"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Box>
                </Paper>

                <Paper elevation={2} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SectionIcon>
                      <ShoppingBag color="primary" />
                    </SectionIcon>
                    <SectionTitle variant="h6">Sản phẩm đặt mua</SectionTitle>
                  </Box>
                  
                  {cartItems.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Giỏ hàng của bạn đang trống.{' '}
                      <RouterLink to="/">Tiếp tục mua sắm</RouterLink>
                    </Alert>
                  ) : (
                    <List sx={{ width: '100%' }}>
                      {cartItems.map((item) => (
                        <React.Fragment key={item.product._id}>
                          <ListItem sx={{ py: 2, px: 0 }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={2} sm={1}>
                                <Card elevation={0}>
                                  <CardMedia
                                    component="img"
                                    image={item.product.image || 'https://placehold.co/100x100?text=No+Image'}
                                    alt={item.product.name}
                                    sx={{ height: '50px', objectFit: 'contain' }}
                                  />
                                </Card>
                              </Grid>
                              <Grid item xs={6} sm={7}>
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
                                />
                              </Grid>
                              <Grid item xs={4} sm={4}>
                                <Typography variant="body2">
                                  {item.quantity} x{' '}
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  }).format(item.product.price)}{' '}
                                  ={' '}
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  }).format(item.product.price * item.quantity)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                  
                  <Button
                    component={RouterLink}
                    to="/cart"
                    size="small"
                    sx={{ mt: 2 }}
                  >
                    Chỉnh sửa
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tổng đơn hàng
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Tạm tính:</Typography>
                      <Typography>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(itemsPrice)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Phí vận chuyển:</Typography>
                      <Typography>
                        {shippingPrice === 0
                          ? 'Miễn phí'
                          : new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(shippingPrice)}
                      </Typography>
                    </Box>
                    {taxPrice > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Thuế:</Typography>
                        <Typography>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(taxPrice)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Tổng cộng:</Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(totalPrice)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleSubmit}
                      disabled={cartItems.length === 0 || loading}
                      startIcon={loading && <CircularProgress size={20} color="inherit" />}
                      sx={{ minWidth: '200px' }}
                    >
                      {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                    </Button>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </Paper>
                
                {paymentMethod === 'banking' && (
                  <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin chuyển khoản
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2">Ngân hàng: <strong>BIDV</strong></Typography>
                      <Typography variant="body2">Số tài khoản: <strong>1234567890</strong></Typography>
                      <Typography variant="body2">Chủ tài khoản: <strong>CÔNG TY TNHH THƯƠNG MẠI ABC</strong></Typography>
                      <Typography variant="body2">Nội dung: <strong>Thanh toan don hang [Họ tên]</strong></Typography>
                    </Box>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán của bạn.
                    </Alert>
                  </Paper>
                )}
              </Grid>
            </Grid>
          )}
        </>
      )}
      
      {/* Snackbar notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="info">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlaceOrderPage; 