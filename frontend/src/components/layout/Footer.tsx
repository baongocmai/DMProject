import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Về chúng tôi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shop Online cung cấp các sản phẩm chất lượng cao với giá cả hợp lý.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Liên hệ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Địa chỉ: 123 Đường ABC, Quận XYZ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: contact@shoponline.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điện thoại: (123) 456-7890
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Truy cập nhanh
            </Typography>
            <Link href="/" color="inherit" display="block">
              Trang chủ
            </Link>
            <Link href="/cart" color="inherit" display="block">
              Giỏ hàng
            </Link>
            <Link href="/login" color="inherit" display="block">
              Đăng nhập
            </Link>
            <Link href="/register" color="inherit" display="block">
              Đăng ký
            </Link>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="/">
              Shop Online
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 