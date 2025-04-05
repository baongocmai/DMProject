import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { saveShippingAddress } from '../redux/slices/cartSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  FormHelperText,
  Step,
  StepLabel,
  Stepper,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Define types
interface ShippingFormData {
  fullName: string;
  address: string;
  district: string;
  province: string;
  phoneNumber: string;
}

// Validation schema
const ShippingSchema = Yup.object().shape({
  fullName: Yup.string().required('Họ tên không được để trống'),
  address: Yup.string().required('Địa chỉ cụ thể không được để trống'),
  district: Yup.string().required('Quận/Huyện không được để trống'),
  province: Yup.string().required('Tỉnh/thành phố không được để trống'),
  phoneNumber: Yup.string()
    .required('Số điện thoại không được để trống')
    .matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
});

// Style the form fields
const FormTextField = styled(TextField)({
  marginBottom: 16,
});

// Checkout steps
const steps = ['Giỏ hàng', 'Thông tin giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

// Danh sách các quận/huyện của Hà Nội
const hanoiDistricts = [
  'Quận Ba Đình',
  'Quận Hoàn Kiếm',
  'Quận Tây Hồ',
  'Quận Long Biên',
  'Quận Cầu Giấy',
  'Quận Đống Đa',
  'Quận Hai Bà Trưng',
  'Quận Hoàng Mai',
  'Quận Thanh Xuân',
  'Quận Hà Đông',
  'Quận Nam Từ Liêm',
  'Quận Bắc Từ Liêm',
  'Huyện Sóc Sơn',
  'Huyện Mê Linh',
  'Huyện Đông Anh',
  'Huyện Gia Lâm',
  'Quận Thanh Trì',
  'Huyện Đan Phượng',
  'Huyện Hoài Đức',
  'Huyện Quốc Oai',
  'Huyện Thạch Thất',
  'Huyện Chương Mỹ',
  'Huyện Thanh Oai',
  'Huyện Thường Tín',
  'Huyện Phú Xuyên',
  'Huyện Ứng Hòa',
  'Huyện Mỹ Đức',
  'Thị xã Sơn Tây',
  'Huyện Ba Vì',
];

const ShippingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { shippingAddress } = useSelector((state: RootState) => state.cart as any);
  const { userInfo } = useSelector((state: RootState) => state.user as any);

  // Set initial form values
  const initialValues: ShippingFormData = {
    fullName: shippingAddress?.fullName || '',
    address: shippingAddress?.address || '',
    district: shippingAddress?.district || '',
    province: 'Hà Nội', // Mặc định là Hà Nội
    phoneNumber: shippingAddress?.phoneNumber || '',
  };

  useEffect(() => {
    // Không còn chuyển hướng đến đăng nhập nữa
    // Kiểm tra xem có email khách không
    const guestEmail = localStorage.getItem('guestEmail');
    const isGuest = !userInfo && guestEmail;
    
    if (!userInfo && !isGuest) {
      // Nếu không có thông tin đăng nhập và không có email khách
      // thì chuyển về giỏ hàng để nhập email
      navigate('/cart');
    }
  }, [navigate, userInfo]);

  const handleSubmit = (values: ShippingFormData) => {
    // Kết hợp district và address để tạo địa chỉ đầy đủ
    const formattedValues = {
      ...values,
      city: values.district, // Đảm bảo tương thích với schema cũ
      postalCode: '100000', // Mã bưu điện mặc định cho Hà Nội
      country: 'Vietnam', // Thêm trường country với giá trị mặc định là Vietnam
    };
    
    console.log('ShippingPage - Saving shipping address:', formattedValues);
    
    dispatch(saveShippingAddress(formattedValues));
    navigate('/payment');
  };

  return (
    <Box sx={{ my: 4 }}>
      <Stepper activeStep={1} alternativeLabel sx={{ mb: 4 }}>
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
              Thông tin giao hàng
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Hiện tại, chúng tôi chỉ hỗ trợ giao hàng trong khu vực Hà Nội.
            </Alert>

            <Formik
              initialValues={initialValues}
              validationSchema={ShippingSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, values, handleChange }) => (
                <Form>
                  <FormControl fullWidth error={touched.fullName && Boolean(errors.fullName)}>
                    <FormTextField
                      id="fullName"
                      name="fullName"
                      label="Họ và tên"
                      value={values.fullName}
                      onChange={handleChange}
                      error={touched.fullName && Boolean(errors.fullName)}
                      helperText={touched.fullName && errors.fullName}
                      fullWidth
                      required
                    />
                  </FormControl>

                  <FormControl fullWidth error={touched.province && Boolean(errors.province)}>
                    <FormTextField
                      id="province"
                      name="province"
                      label="Tỉnh/Thành phố"
                      value={values.province}
                      InputProps={{
                        readOnly: true,
                      }}
                      fullWidth
                      required
                    />
                  </FormControl>

                  <FormControl fullWidth error={touched.district && Boolean(errors.district)}>
                    <FormTextField
                      id="district"
                      name="district"
                      select
                      label="Quận/Huyện"
                      value={values.district}
                      onChange={handleChange}
                      error={touched.district && Boolean(errors.district)}
                      helperText={touched.district && errors.district}
                      fullWidth
                      required
                    >
                      {hanoiDistricts.map((district) => (
                        <MenuItem key={district} value={district}>
                          {district}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </FormControl>

                  <FormControl fullWidth error={touched.address && Boolean(errors.address)}>
                    <FormTextField
                      id="address"
                      name="address"
                      label="Địa chỉ cụ thể (Số nhà, đường, phường/xã)"
                      value={values.address}
                      onChange={handleChange}
                      error={touched.address && Boolean(errors.address)}
                      helperText={touched.address && errors.address}
                      fullWidth
                      required
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
                      required
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Tiếp tục
                  </Button>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShippingPage; 