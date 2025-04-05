import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getUserOrders } from '../redux/slices/orderSlice';
import {
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Grid,
  TablePagination,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Pending,
  Visibility,
  LocalShipping,
} from '@mui/icons-material';
import Loader from '../components/layout/Loader';
import Message from '../components/layout/Message';

// Types
interface Order {
  _id: string;
  createdAt: Date;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
}

interface OrderListState {
  orders: Order[] | any;
  loading: boolean;
  error: string | null;
}

const UserOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
  // Get orders from Redux
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.order as OrderListState
  );
  
  // Get user info from Redux
  const { userInfo } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Fetch user orders
    dispatch(getUserOrders());
  }, [dispatch, navigate, userInfo]);

  // Handle pagination changes
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getOrderStatusChip = (order: Order) => {
    if (order.isDelivered) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Đã giao hàng"
          color="success"
          size="small"
        />
      );
    } else if (order.isPaid) {
      return (
        <Chip
          icon={<LocalShipping />}
          label="Đang vận chuyển"
          color="primary"
          size="small"
        />
      );
    } else {
      return (
        <Chip
          icon={<Pending />}
          label="Đang xử lý"
          color="warning"
          size="small"
        />
      );
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  // Đảm bảo orders là một mảng
  const safeOrders = Array.isArray(orders) ? orders : [];
  const ordersCount = safeOrders.length;
  console.log('User orders:', safeOrders);

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Lịch sử đơn hàng
      </Typography>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message severity="error">{error}</Message>
      ) : ordersCount === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Bạn chưa có đơn hàng nào
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Bắt đầu mua sắm
          </Button>
        </Paper>
      ) : (
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Ngày đặt</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Thanh toán</TableCell>
                  <TableCell>Vận chuyển</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Chi tiết</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? safeOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : safeOrders
                ).map((order) => (
                  <TableRow hover key={order._id}>
                    <TableCell>{order._id.substring(order._id.length - 8)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.totalPrice)}
                    </TableCell>
                    <TableCell>
                      {order.isPaid ? (
                        <Chip
                          icon={<CheckCircle />}
                          label={`Đã thanh toán (${formatDate(order.paidAt)})`}
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip 
                          icon={<Cancel />} 
                          label="Chưa thanh toán" 
                          color="error" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {order.isDelivered ? (
                        <Chip
                          icon={<CheckCircle />}
                          label={`Đã giao (${formatDate(order.deliveredAt)})`}
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip 
                          icon={<Pending />} 
                          label="Chưa giao" 
                          color="warning" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>{getOrderStatusChip(order)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/order/${order._id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={ordersCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} trên ${count !== -1 ? count : `nhiều hơn ${to}`}`
            }
          />
        </Paper>
      )}
    </Box>
  );
};

export default UserOrdersPage; 