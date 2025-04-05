import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { savePaymentMethod } from '../redux/slices/cartSlice';
import {
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';
import {
  CreditCard,
  AccountBalanceWallet,
  LocalAtm,
} from '@mui/icons-material';

// Payment methods
const paymentMethods = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    icon: <LocalAtm color="primary" />,
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
  },
  {
    id: 'banking',
    name: 'Chuyển khoản ngân hàng',
    icon: <AccountBalanceWallet color="primary" />,
    description: 'Chuyển khoản qua ngân hàng hoặc ứng dụng banking',
  },
  {
    id: 'credit_card',
    name: 'Thẻ tín dụng / Ghi nợ',
    icon: <CreditCard color="primary" />,
    description: 'Thanh toán bằng thẻ Visa, Mastercard, JCB',
  },
];

// Checkout steps
const steps = ['Giỏ hàng', 'Thông tin giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const { shippingAddress } = useSelector((state: RootState) => state.cart as any);
  const { userInfo } = useSelector((state: RootState) => state.user as any);

  useEffect(() => {
    // Redirect to shipping if shipping address is not set
    if (!shippingAddress) {
      navigate('/shipping');
    }
    
    // Kiểm tra xem có email khách không
    const guestEmail = localStorage.getItem('guestEmail');
    const isGuest = !userInfo && guestEmail;
    
    if (!userInfo && !isGuest) {
      // Nếu không có thông tin đăng nhập và không có email khách
      // thì chuyển về giỏ hàng để nhập email
      navigate('/cart');
    }
  }, [navigate, shippingAddress, userInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <Box sx={{ my: 4 }}>
      <Stepper activeStep={2} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom align="center">
              Phương thức thanh toán
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <FormLabel component="legend">Chọn phương thức thanh toán</FormLabel>
                <RadioGroup
                  aria-label="payment-method"
                  name="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {paymentMethods.map((method) => (
                    <Paper
                      key={method.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid',
                        borderColor: paymentMethod === method.id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        '&:hover': {
                          borderColor: 'primary.light',
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 1 }}>{method.icon}</Box>
                            <Box>
                              <Typography variant="subtitle1">{method.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={() => navigate('/shipping')}
                  variant="outlined"
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Tiếp tục
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentPage; 