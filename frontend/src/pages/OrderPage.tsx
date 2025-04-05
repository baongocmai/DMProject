import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getOrderDetails, payOrder, deliverOrder } from '../redux/slices/orderSlice';
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
  Chip,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalShipping,
  Payment,
  Person,
  ShoppingBag,
  CheckCircle,
  Pending,
  CalendarToday,
  AccessTime,
  Done,
} from '@mui/icons-material';
import Loader from '../components/layout/Loader';
import Message from '../components/layout/Message';
import { formatCurrency } from '../utils/formatters';

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
  minWidth: 140,
}));

const InfoValue = styled(Typography)({
  color: 'text.secondary',
  flex: 1,
});

// Interface for order data
interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  qty?: number;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phoneNumber: string;
  district?: string;
}

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  guestInfo?: GuestInfo;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
}

interface OrderState {
  order: Order | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Payment method display names
const paymentMethodNames: {[key: string]: string} = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  banking: 'Chuyển khoản ngân hàng',
  credit_card: 'Thẻ tín dụng / Ghi nợ',
};

const OrderStatusChip = ({ isPaid, isDelivered }: { isPaid: boolean; isDelivered: boolean }) => {
  if (isDelivered) {
    return <Chip icon={<CheckCircle />} label="Đã giao hàng" color="success" />;
  } else if (isPaid) {
    return <Chip icon={<LocalShipping />} label="Đang vận chuyển" color="primary" />;
  } else {
    return <Chip icon={<Pending />} label="Chờ xác nhận" color="warning" />;
  }
};

const OrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [confirmDeliverOpen, setConfirmDeliverOpen] = useState(false);
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
  
  // Get order details from Redux
  const orderDetails = useSelector((state: RootState) => state.order as OrderState);
  const { order, loading, error } = orderDetails;
  
  // Get user info from Redux
  const { userInfo } = useSelector((state: RootState) => state.user as any);

  // State theo dõi đơn hàng giả lập
  const [isFakeOrder, setIsFakeOrder] = useState(false);

  // State để lưu dữ liệu đơn hàng giả lập từ localStorage
  const [localFakeOrder, setLocalFakeOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Kiểm tra xem có email khách không
    const guestEmail = localStorage.getItem('guestEmail');
    const isGuest = !userInfo && guestEmail;
    
    // Kiểm tra quyền truy cập
    if (!userInfo && !isGuest) {
      navigate('/login');
      return;
    }
    
    // Nếu ID là fake order hoặc không có ID
    if (id && id.startsWith('fake_order_')) {
      setIsFakeOrder(true);
      console.log('Đang xem đơn hàng giả lập:', id);
      
      // Nếu không có order data, nhưng đang xem fake order
      if (!order) {
        console.log('Không tìm thấy dữ liệu đơn hàng giả lập, kiểm tra localStorage');
        // Thử tìm trong localStorage
        try {
          const fakeOrderData = localStorage.getItem(`fakeOrder_${id}`);
          if (fakeOrderData) {
            console.log('Đã tìm thấy dữ liệu đơn hàng giả lập trong localStorage');
            const parsedOrder = JSON.parse(fakeOrderData);
            setLocalFakeOrder(parsedOrder as Order);
          } else {
            console.warn('Không tìm thấy dữ liệu đơn hàng giả lập trong localStorage');
          }
        } catch (err) {
          console.error('Lỗi khi đọc dữ liệu fake order từ localStorage:', err);
        }
      }
    } else {
      setIsFakeOrder(false);
      setLocalFakeOrder(null);
      console.log('Đang xem đơn hàng thực:', id);
      // Fetch order details
      if (!order || id !== order._id) {
        dispatch(getOrderDetails(id as string));
      }
    }
  }, [dispatch, id, navigate, order, userInfo]);

  const handlePayOrder = () => {
    dispatch(payOrder(id as string));
    setConfirmPaymentOpen(false);
  };

  const handleDeliverOrder = () => {
    dispatch(deliverOrder(id as string));
    setConfirmDeliverOpen(false);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sử dụng order từ Redux hoặc từ localStorage nếu là fake order
  const displayOrder = order || localFakeOrder;

  // Tính toán giá tiền nếu order tồn tại và có orderItems
  const itemsPrice = displayOrder && displayOrder.orderItems && Array.isArray(displayOrder.orderItems) 
    ? displayOrder.orderItems.reduce(
        (acc, item) => acc + (item.price * (item.qty || item.quantity || 1)), 
        0
      ) 
    : 0;

  // Tính toán phí vận chuyển dựa trên tổng giá
  const shippingPrice = itemsPrice > 500000 ? 0 : 30000;
  
  // Thuế 0%
  const taxPrice = 0;

  return loading ? (
    <Loader />
  ) : error ? (
    <Message severity="error">{error}</Message>
  ) : !displayOrder ? (
    <Message severity="info">Không tìm thấy thông tin đơn hàng</Message>
  ) : (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            Chi tiết đơn hàng
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Mã đơn hàng: {id}
          </Typography>
        </Box>
        {isFakeOrder && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Đây là đơn hàng được tạo ở CHẾ ĐỘ THỬ NGHIỆM và không được lưu vào database. 
            Thông tin này sẽ bị mất sau khi refresh trang. Vui lòng kiểm tra kết nối backend.
          </Alert>
        )}
        <OrderStatusChip isPaid={displayOrder.isPaid} isDelivered={displayOrder.isDelivered} />
      </Box>

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
                <InfoValue variant="body1">{displayOrder.shippingAddress.fullName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body1">Địa chỉ:</InfoLabel>
                <InfoValue variant="body1">
                  {displayOrder.shippingAddress.address}, {displayOrder.shippingAddress.district || displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.province}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body1">Số điện thoại:</InfoLabel>
                <InfoValue variant="body1">{displayOrder.shippingAddress.phoneNumber}</InfoValue>
              </InfoItem>
              {displayOrder.isDelivered ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Đã giao hàng vào {formatDate(displayOrder.deliveredAt)}
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Chưa giao hàng
                </Alert>
              )}
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
                  {paymentMethodNames[displayOrder.paymentMethod] || displayOrder.paymentMethod}
                </InfoValue>
              </InfoItem>
              {displayOrder.isPaid ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Đã thanh toán vào {formatDate(displayOrder.paidAt)}
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Chưa thanh toán
                </Alert>
              )}
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SectionIcon>
                <ShoppingBag color="primary" />
              </SectionIcon>
              <SectionTitle variant="h6">Sản phẩm đã đặt</SectionTitle>
            </Box>
            
            <List sx={{ width: '100%' }}>
              {displayOrder.orderItems.map((item) => (
                <React.Fragment key={item.product}>
                  <ListItem sx={{ py: 2, px: 0 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={2} sm={1}>
                        <Card elevation={0}>
                          <CardMedia
                            component="img"
                            image={item.image || 'https://placehold.co/100x100?text=No+Image'}
                            alt={item.name}
                            sx={{ height: '50px', objectFit: 'contain' }}
                          />
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={7}>
                        <ListItemText
                          primary={
                            <Typography
                              component={RouterLink}
                              to={`/product/${item.product}`}
                              color="inherit"
                              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                              {item.name}
                            </Typography>
                          }
                        />
                      </Grid>
                      <Grid item xs={4} sm={4}>
                        <Typography variant="body2">
                          {item.quantity} x{' '}
                          {formatCurrency(item.price)}{' '}
                          ={' '}
                          {formatCurrency(item.price * item.quantity)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SectionIcon>
                <CalendarToday color="primary" />
              </SectionIcon>
              <SectionTitle variant="h6">Thông tin đơn hàng</SectionTitle>
            </Box>
            <Box sx={{ pl: 4 }}>
              <InfoItem>
                <InfoLabel variant="body1">Ngày đặt hàng:</InfoLabel>
                <InfoValue variant="body1">{formatDate(displayOrder.createdAt)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body1">Cập nhật cuối:</InfoLabel>
                <InfoValue variant="body1">
                  {displayOrder.isDelivered ? formatDate(displayOrder.deliveredAt) : displayOrder.isPaid ? formatDate(displayOrder.paidAt) : formatDate(displayOrder.createdAt)}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body1">Trạng thái:</InfoLabel>
                <InfoValue variant="body1">
                  {displayOrder.isDelivered 
                    ? 'Đã hoàn thành' 
                    : displayOrder.isPaid 
                      ? 'Đang vận chuyển' 
                      : 'Đang xử lý'}
                </InfoValue>
              </InfoItem>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tổng đơn hàng
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>
                  {formatCurrency(itemsPrice)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>
                  {formatCurrency(shippingPrice)}
                </Typography>
              </Box>
              {taxPrice > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Thuế:</Typography>
                  <Typography>
                    {formatCurrency(taxPrice)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(displayOrder.totalPrice)}
              </Typography>
            </Box>
          </Paper>
          
          {/* Admin Actions */}
          {userInfo && userInfo.isAdmin && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quản lý đơn hàng
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!displayOrder.isPaid && (
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => setConfirmPaymentOpen(true)}
                  >
                    Đánh dấu đã thanh toán
                  </Button>
                )}
                
                {displayOrder.isPaid && !displayOrder.isDelivered && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setConfirmDeliverOpen(true)}
                  >
                    Đánh dấu đã giao hàng
                  </Button>
                )}
              </Box>
            </Paper>
          )}
          
          {displayOrder.paymentMethod === 'banking' && !displayOrder.isPaid && (
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin chuyển khoản
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Ngân hàng: <strong>BIDV</strong></Typography>
                <Typography variant="body2">Số tài khoản: <strong>1234567890</strong></Typography>
                <Typography variant="body2">Chủ tài khoản: <strong>CÔNG TY TNHH THƯƠNG MẠI ABC</strong></Typography>
                <Typography variant="body2">Nội dung: <strong>Thanh toan don hang {id?.slice(-6)}</strong></Typography>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán của bạn.
              </Alert>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Confirm Payment Dialog */}
      <Dialog
        open={confirmPaymentOpen}
        onClose={() => setConfirmPaymentOpen(false)}
      >
        <DialogTitle>Xác nhận thanh toán</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn đánh dấu đơn hàng này là đã thanh toán?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPaymentOpen(false)}>Hủy</Button>
          <Button onClick={handlePayOrder} color="primary" variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delivery Dialog */}
      <Dialog
        open={confirmDeliverOpen}
        onClose={() => setConfirmDeliverOpen(false)}
      >
        <DialogTitle>Xác nhận giao hàng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn đánh dấu đơn hàng này là đã giao hàng?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeliverOpen(false)}>Hủy</Button>
          <Button onClick={handleDeliverOrder} color="primary" variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderPage; 