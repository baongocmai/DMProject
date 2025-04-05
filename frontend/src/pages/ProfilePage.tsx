import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getUserDetails, updateUserProfile } from '../redux/slices/userSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Divider,
  Alert,
  Tab,
  Tabs,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AccountCircle,
  Lock,
  Email,
  Phone,
  Save,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import Message from '../components/layout/Message';

// Define types
interface ProfileFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

interface UserState {
  userInfo: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    isAdmin: boolean;
    token: string;
  } | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Validation schema
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Họ tên không được để trống'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Email không được để trống'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 kí tự')
    .test('password-or-empty', 'Mật khẩu phải có ít nhất 6 kí tự', function(value) {
      // Allow empty password (for keeping current password)
      return !value || value.length >= 6;
    }),
  confirmPassword: Yup.string()
    .test('passwords-match', 'Mật khẩu xác nhận không khớp', function(value) {
      return this.parent.password === value;
    }),
  phoneNumber: Yup.string()
    .matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ')
    .notRequired(),
});

// Style the form fields
const FormTextField = styled(TextField)({
  marginBottom: 16,
});

// Tab Panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get user state from Redux
  const { userInfo, loading, error, success } = useSelector(
    (state: RootState) => state.user as UserState
  );
  
  // Local success message state
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Fetch user details
    dispatch(getUserDetails());
    
    // Reset success message after a delay
    if (success) {
      setUpdateSuccess(true);
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [dispatch, navigate, userInfo, success]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Set initial form values
  const initialValues: ProfileFormData = {
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    password: '',
    confirmPassword: '',
    phoneNumber: userInfo?.phoneNumber || '',
  };

  const handleSubmit = (values: ProfileFormData) => {
    // Log initial values for debugging
    console.log('Form values submitted:', values);
    
    // Remove confirmPassword as it's not needed by the API
    const { confirmPassword, ...updateData } = values;
    
    // Only include fields that have changed
    const changedFields: Record<string, any> = {};
    
    if (updateData.name !== userInfo?.name) changedFields.name = updateData.name;
    if (updateData.email !== userInfo?.email) changedFields.email = updateData.email;
    if (updateData.phoneNumber !== userInfo?.phoneNumber) changedFields.phoneNumber = updateData.phoneNumber;
    
    // Only include password if it's not empty
    if (updateData.password) {
      changedFields.password = updateData.password;
      console.log('Including password in update');
    }
    
    // Log the final data being sent to the API
    console.log('Actual data being sent to API:', changedFields);
    
    // Only dispatch if there are changes
    if (Object.keys(changedFields).length > 0) {
      console.log('Dispatching updateUserProfile with:', changedFields);
      dispatch(updateUserProfile(changedFields));
    } else {
      console.log('No changes detected, skipping update');
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Thông tin tài khoản
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {userInfo?.name?.charAt(0)}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {userInfo?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {userInfo?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {userInfo?.phoneNumber || 'Chưa cập nhật số điện thoại'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Tài khoản
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountCircle sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  {userInfo?.isAdmin ? 'Quản trị viên' : 'Khách hàng'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  {userInfo?.email}
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/orders')}
              sx={{ mt: 2 }}
            >
              Lịch sử đơn hàng
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8} lg={9}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Thông tin cá nhân" />
                <Tab label="Đổi mật khẩu" />
              </Tabs>
            </Box>

            {updateSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Cập nhật thông tin thành công!
              </Alert>
            )}

            {error && (
              <Message severity="error" sx={{ mt: 2 }}>
                {error}
              </Message>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={ProfileSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, values, handleChange, setFieldValue }) => (
                <Form>
                  <TabPanel value={tabValue} index={0}>
                    <FormControl fullWidth error={touched.name && Boolean(errors.name)}>
                      <FormTextField
                        id="name"
                        name="name"
                        label="Họ và tên"
                        value={values.name}
                        onChange={handleChange}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountCircle color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>

                    <FormControl fullWidth error={touched.email && Boolean(errors.email)}>
                      <FormTextField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>

                    <FormControl fullWidth error={touched.phoneNumber && Boolean(errors.phoneNumber)}>
                      <FormTextField
                        id="phoneNumber"
                        name="phoneNumber"
                        label="Số điện thoại"
                        value={values.phoneNumber}
                        onChange={handleChange}
                        error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                        helperText={touched.phoneNumber && errors.phoneNumber}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      sx={{ mt: 2 }}
                    >
                      Cập nhật thông tin
                    </Button>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Để thay đổi mật khẩu, vui lòng nhập mật khẩu mới bên dưới
                    </Typography>

                    <FormControl fullWidth error={touched.password && Boolean(errors.password)}>
                      <FormTextField
                        id="password"
                        name="password"
                        label="Mật khẩu mới"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>

                    <FormControl fullWidth error={touched.confirmPassword && Boolean(errors.confirmPassword)}>
                      <FormTextField
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={values.confirmPassword}
                        onChange={handleChange}
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleToggleConfirmPasswordVisibility}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading || (!values.password && !values.confirmPassword)}
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      sx={{ mt: 2 }}
                    >
                      Cập nhật mật khẩu
                    </Button>
                  </TabPanel>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage; 