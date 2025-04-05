import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchProductDetails, clearProductDetails } from '../redux/slices/productSlice';
import { addItemToCart, updateQuantityLocally } from '../redux/slices/cartSlice';
import { Product } from '../types';
import {
  Button,
  Card,
  CardMedia,
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
  TextField,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart,
  ArrowBack,
} from '@mui/icons-material';
import Loader from '../components/layout/Loader';
import Message from '../components/layout/Message';

// Define the product state interface
interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  recommendations: string[][];
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Add debugging logs for product state
  const productState = useSelector((state: RootState) => state.product as ProductState);
  console.log('ProductPage - Product state:', productState);
  
  const { product, loading, error } = productState;
  
  // Lấy trạng thái loading của từng sản phẩm từ cartSlice
  const loadingItems = useSelector((state: RootState) => state.cart.loadingItems || {});
  
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('ProductPage - Fetching product details for ID:', id);
      dispatch(fetchProductDetails(id));
    }
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      // Đảm bảo số lượng là hợp lệ
      const safeQuantity = Number.isNaN(quantity) ? 1 : Math.max(1, Math.min(product.stock, Math.round(quantity)));
      
      if (safeQuantity > 0) {
        console.log('Adding to cart from ProductPage:', product._id, 'quantity:', safeQuantity);
        
        // Đặt state loading local
        setIsAddingToCart(true);
        
        // Áp dụng updateQuantityLocally trước để cải thiện UX
        dispatch(updateQuantityLocally({ 
          productId: product._id, 
          quantity: safeQuantity 
        }));
        
        // Sau đó đưa sản phẩm vào giỏ hàng qua API
        dispatch(addItemToCart({ 
          productId: product._id, 
          quantity: safeQuantity 
        })).finally(() => {
          // Kết thúc loading bất kể thành công hay thất bại
          setIsAddingToCart(false);
        });
      }
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Kiểm tra xem giá trị có phải là số không
    if (value === '') {
      // Nếu người dùng xóa hết, giữ giá trị hiện tại
      return;
    }
    
    const newQuantity = parseInt(value, 10);
    
    if (!isNaN(newQuantity)) {
      // Đảm bảo giá trị nằm trong khoảng hợp lệ
      if (product) {
        const validQuantity = Math.max(1, Math.min(product.stock, newQuantity));
        setQuantity(validQuantity);
      } else {
        setQuantity(Math.max(1, newQuantity));
      }
    }
  };

  // Kiểm tra trạng thái loading cho sản phẩm này
  const isProductLoading = product ? (loadingItems[product._id] || isAddingToCart) : false;

  if (loading) return <Loader />;
  if (error) return <Message severity="error">{error}</Message>;
  if (!product) return <Message severity="info">Không tìm thấy sản phẩm</Message>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Trang chủ
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Card>
                <CardMedia
                  component="img"
                  image={product.image || 'https://placehold.co/600x400?text=No+Image'}
                  alt={product.name}
                  sx={{ height: '400px', objectFit: 'contain' }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
                <Typography variant="h5" color="primary">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product.price)}
                </Typography>
                <Chip
                  label={product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  color={product.stock > 0 ? 'success' : 'error'}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Mô tả sản phẩm
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                Danh mục: {product.category}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
                Còn lại: {product.stock} sản phẩm
              </Typography>
              
              {product.stock > 0 ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      Số lượng:
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <TextField
                      size="small"
                      value={quantity}
                      onChange={handleQuantityChange}
                      type="number"
                      InputProps={{ inputProps: { min: 1, max: product.stock } }}
                      sx={{ width: '70px', mx: 1 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={handleAddToCart}
                    sx={{ mt: 2 }}
                    fullWidth
                    disabled={isProductLoading}
                  >
                    {isProductLoading ? <CircularProgress size={24} /> : 'Thêm vào giỏ hàng'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  disabled
                  fullWidth
                >
                  Hết hàng
                </Button>
              )}

              <Button
                component={RouterLink}
                to="/"
                startIcon={<ArrowBack />}
                sx={{ mt: 3 }}
              >
                Quay lại danh sách sản phẩm
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProductPage; 