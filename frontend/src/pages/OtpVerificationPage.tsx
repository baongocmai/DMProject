import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { verifyOtp, clearError } from '../redux/slices/userSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  Alert,
} from '@mui/material';
import Loader from '../components/layout/Loader';
import Message from '../components/layout/Message';

const validationSchema = Yup.object({
  otp: Yup.string()
    .required('OTP là bắt buộc')
    .matches(/^\d+$/, 'OTP chỉ chứa số')
    .length(6, 'OTP phải có đúng 6 ký tự'),
});

const OtpVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, userInfo, userId: storeUserId, success } = useSelector((state: RootState) => state.user);
  const [countdown, setCountdown] = useState(120);
  
  // Get userId from location state or from Redux store
  const userId = location.state?.userId || storeUserId;

  // Debug information
  console.log('OTP Verification Page - userId from location:', location.state?.userId);
  console.log('OTP Verification Page - userId from store:', storeUserId);
  console.log('OTP Verification Page - userInfo:', userInfo);

  // Redirect if user is already verified
  useEffect(() => {
    if (userInfo && userInfo.isVerified) {
      console.log('User is already verified, redirecting to home page');
      navigate('/');
    }
  }, [userInfo, navigate]);

  // Redirect after successful verification
  useEffect(() => {
    if (userInfo && userInfo.token) {
      console.log('User has token, verification was successful, redirecting to home page');
      navigate('/');
    }
  }, [userInfo, navigate]);

  // Redirect if no userId is provided
  useEffect(() => {
    if (!userId) {
      console.log('No userId available, redirecting to register page');
      navigate('/register');
    } else {
      console.log('Using userId for verification:', userId);
    }
  }, [userId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema,
    onSubmit: (values) => {
      if (!userId) {
        console.error('Cannot verify OTP: userId is missing');
        return;
      }

      // Ensure OTP is exactly 6 digits
      const formattedOtp = values.otp.trim().slice(0, 6).padStart(6, '0');
      console.log('Submitting OTP verification:', { userId, otp: formattedOtp });
      
      // Dispatch without using unwrap to avoid potential issues
      dispatch(verifyOtp({ 
        userId, 
        otp: formattedOtp 
      }));
      // The redirection will be handled by the useEffect that watches userInfo
    },
  });

  if (!userId) {
    return (
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
          <Message severity="error">
            Không thể xác thực OTP vì thiếu thông tin người dùng. Vui lòng đăng ký lại.
          </Message>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/register')}
          >
            Quay lại trang đăng ký
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Xác thực OTP
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Chúng tôi đã gửi một mã OTP đến email của bạn
          </Typography>
          {error && <Message severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Message>}
          
          <Box sx={{ mt: 2, width: '100%' }}>
            <Alert severity="info">
              OTP sẽ hết hạn sau {Math.floor(countdown / 60)}:{countdown % 60 < 10 ? `0${countdown % 60}` : countdown % 60}
            </Alert>
          </Box>
          
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Mã OTP"
              name="otp"
              autoComplete="off"
              autoFocus
              inputProps={{ 
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.otp && Boolean(formik.errors.otp)}
              helperText={formik.touched.otp && formik.errors.otp}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || countdown === 0 || formik.values.otp.length !== 6}
            >
              {loading ? <Loader size={24} text="" /> : 'Xác thực'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default OtpVerificationPage; 