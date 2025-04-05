import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { login } from '../redux/slices/userSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Link,
  Box,
  Typography,
  Container,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Loader from '../components/layout/Loader';
import Message from '../components/layout/Message';
import HomeIcon from '@mui/icons-material/Home';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
});

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state: RootState) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        bgcolor: '#B84C63',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="lg" sx={{ height: '85vh', maxWidth: '1200px' }}>
        <Grid 
          container 
          sx={{ 
            height: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Left side with logo */}
          <Grid 
            item 
            xs={12} 
            md={5} 
            sx={{ 
              bgcolor: '#E8A7B9',
              position: 'relative',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              p: 6,
              borderRadius: '16px 0 0 16px',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
            
            </Box>
            
            {/* Logo Container - D shape with shadow */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '50%',
                maxWidth: 300,
                aspectRatio: '1/1',
                bgcolor: '#B84C63',
                borderRadius: '0% 50% 50% 0%',
                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Box
                component="img"
                src="/logo512.png"
                alt="Logo"
                sx={{
                  width: '70%',
                  height: 'auto',
                  filter: 'brightness(0) invert(1)', // Makes the logo white
                }}
              />
            </Box>
          </Grid>
          
          {/* Right side with form */}
          <Grid 
            item 
            xs={12} 
            md={7} 
            sx={{ 
              bgcolor: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 4, md: 8 },
              borderRadius: isMobile ? '16px' : '0 16px 16px 0',
            }}
          >
            {/* Mobile logo - D shape with shadow for mobile */}
            <Box 
              sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                justifyContent: 'center',
                mt: 3, 
                mb: 2 
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '120px',
                  aspectRatio: '1/1',
                  bgcolor: '#B84C63',
                  borderRadius: '0% 50% 50% 0%',
                  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Box
                  component="img"
                  src="/logo512.png"
                  alt="Logo"
                  sx={{
                    width: '70%',
                    height: 'auto',
                    filter: 'brightness(0) invert(1)', // Makes the logo white
                  }}
                />
              </Box>
            </Box>
            
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                mb: 6,
                mt: isMobile ? 0 : 4,
              }}
            >
              Sign-in
            </Typography>
            
            {error && <Message severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Message>}
            
            <Box 
              component="form" 
              onSubmit={formik.handleSubmit}
              sx={{ 
                width: '100%',
                maxWidth: '380px',
              }}
            >
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                variant="standard"
                margin="normal"
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                variant="standard"
                margin="normal"
                sx={{ mb: 5 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#B84C63',
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  mb: 3,
                  '&:hover': {
                    bgcolor: '#9a3e53',
                  },
                }}
              >
                {loading ? <Loader size={24} /> : 'Login'}
              </Button>
              
              {/* Nút trở về trang chủ */}
              <Button
                component={RouterLink}
                to="/"
                variant="outlined"
                fullWidth
                startIcon={<HomeIcon />}
                sx={{
                  borderColor: '#B84C63',
                  color: '#B84C63',
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  mb: 3,
                  '&:hover': {
                    borderColor: '#9a3e53',
                    bgcolor: 'rgba(184, 76, 99, 0.05)',
                  },
                }}
              >
                Trở về trang chủ
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ display: 'inline', color: 'text.secondary' }}>
                  Don't have an account? 
                </Typography>
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#B84C63',
                    ml: 1,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Signup Here
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;