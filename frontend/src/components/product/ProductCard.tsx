import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItemToCart, updateQuantityLocally } from '../../redux/slices/cartSlice';
import { Product } from '../../types/index';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Rating,
  Box,
} from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { AppDispatch } from '../../redux/store';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Safety check - if product is undefined or incomplete, render placeholder
  if (!product || typeof product !== 'object') {
    console.error('ProductCard received invalid product:', product);
    return (
      <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography>Sản phẩm không khả dụng</Typography>
        </CardContent>
      </Card>
    );
  }

  // Log the product for debugging
  console.log('ProductCard rendering product:', product);

  // Ensure all required properties exist
  const safeProduct = {
    _id: product._id || 'unknown',
    name: product.name || 'Sản phẩm không có tên',
    price: typeof product.price === 'number' ? product.price : 0,
    description: product.description || 'Không có mô tả',
    category: product.category || 'Không phân loại',
    stock: typeof product.stock === 'number' ? product.stock : 0,
    image: product.image || 'https://placehold.co/300x200?text=No+Image',
  };

  const handleAddToCart = () => {
    // Đảm bảo sản phẩm còn hàng trước khi thêm vào giỏ
    if (safeProduct.stock > 0) {
      console.log('Adding to cart from ProductCard:', safeProduct._id);
      // Áp dụng updateQuantityLocally trước để cải thiện UX
      dispatch(updateQuantityLocally({ 
        productId: safeProduct._id, 
        quantity: 1 
      }));
      // Sau đó đưa sản phẩm vào giỏ hàng qua API
      dispatch(addItemToCart({ 
        productId: safeProduct._id, 
        quantity: 1 
      }));
    }
  };

  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={safeProduct.image}
        alt={safeProduct.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {safeProduct.name}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="text.primary">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(safeProduct.price)}
          </Typography>
          <Typography
            variant="body2"
            color={safeProduct.stock > 0 ? 'success.main' : 'error.main'}
          >
            {safeProduct.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {safeProduct.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          component={RouterLink}
          to={`/product/${safeProduct._id}`}
          sx={{ mr: 1 }}
        >
          Chi tiết
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          disabled={safeProduct.stock === 0}
        >
          Thêm vào giỏ
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard; 