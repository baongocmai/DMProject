import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchProducts } from '../redux/slices/productSlice';
import { Product } from '../types/index';
import { 
  testApiConnection, 
  debugProductsEndpoint, 
  findWorkingApiUrl,
  fetchProductsFromAllPossibleEndpoints 
} from '../services/api';
import {
  Grid,
  Typography,
  Container,
  Box,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/layout/Loader';
import Message from '../components/layout/Message';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  recommendations: string[][];
}

// Mock products dự phòng nếu API không hoạt động
const FALLBACK_PRODUCTS = [
  {
    _id: 'mock1',
    name: 'Laptop Gaming Acer Nitro 5',
    price: 22990000,
    description: 'Laptop gaming mạnh mẽ với card đồ họa RTX 3060',
    category: 'Laptop',
    stock: 10,
    image: 'https://placehold.co/600x400?text=Laptop'
  },
  {
    _id: 'mock2',
    name: 'Điện thoại Samsung Galaxy S23',
    price: 18990000,
    description: 'Điện thoại flagship với camera 108MP',
    category: 'Điện thoại',
    stock: 15,
    image: 'https://placehold.co/600x400?text=Phone'
  },
  // ... other mock products ...
];

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Add debugging logs
  const productState = useSelector((state: RootState) => state.product as ProductState);
  console.log('HomePage - Product state:', productState);
  
  const { products, loading, error } = productState;
  console.log('HomePage - Products count:', products?.length || 0);
  console.log('HomePage - Products array:', products);
  
  const { userInfo } = useSelector((state: RootState) => state.user);

  // Add state for search and category filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [debugProducts, setDebugProducts] = useState<Product[] | null>(null);
  const [apiTestStatus, setApiTestStatus] = useState<string>('Đang kiểm tra kết nối API...');

  useEffect(() => {
    // Comprehensive API testing
    const testAllApis = async () => {
      setApiTestStatus('Đang kiểm tra kết nối API...');
      
      try {
        // Bước 1: Thử kết nối thông thường
        console.log('Step 1: Testing normal API connection');
        const normalConnected = await testApiConnection();
        
        if (normalConnected) {
          setApiTestStatus('Kết nối API bình thường thành công');
          setApiStatus('connected');
          dispatch(fetchProducts());
          return;
        }
        
        // Bước 2: Thử tìm URL API hoạt động
        console.log('Step 2: Finding working API URL');
        setApiTestStatus('Đang tìm URL API hoạt động...');
        const apiUrlResult = await findWorkingApiUrl();
        
        if (apiUrlResult.success) {
          setApiTestStatus(`Đã tìm thấy URL API hoạt động: ${apiUrlResult.url}`);
          setApiStatus('connected');
          if (apiUrlResult.data) {
            setDebugProducts(apiUrlResult.data);
          } else {
            dispatch(fetchProducts());
          }
          return;
        }
        
        // Bước 3: Thử fetch sản phẩm trực tiếp
        console.log('Step 3: Fetching products directly');
        setApiTestStatus('Đang thử fetch sản phẩm trực tiếp...');
        const directProducts = await fetchProductsFromAllPossibleEndpoints();
        
        if (directProducts) {
          setApiTestStatus('Đã lấy được sản phẩm bằng phương pháp trực tiếp');
          setApiStatus('connected');
          setDebugProducts(directProducts);
          return;
        }
        
        // Bước 4: Thử debug endpoint
        console.log('Step 4: Debug endpoint');
        setApiTestStatus('Đang gỡ lỗi endpoint...');
        const debugResult = await debugProductsEndpoint();
        
        if (debugResult.success && debugResult.data) {
          setApiTestStatus('Đã lấy được sản phẩm bằng gỡ lỗi');
          setApiStatus('connected');
          setDebugProducts(debugResult.data);
          return;
        }
        
        // Nếu tất cả đều thất bại
        console.error('All API connection methods failed');
        setApiTestStatus('Không thể kết nối đến API sau khi thử tất cả phương pháp');
        setApiStatus('disconnected');
        setDebugProducts(FALLBACK_PRODUCTS);
        
      } catch (err) {
        console.error('Error in API testing:', err);
        setApiTestStatus('Lỗi khi kiểm tra kết nối API');
        setApiStatus('disconnected');
        setDebugProducts(FALLBACK_PRODUCTS);
      }
    };
    
    testAllApis();
  }, [dispatch]);

  // Ưu tiên sử dụng sản phẩm từ Redux store, nếu không có thì dùng debugProducts
  const allProducts = products.length > 0 ? products : (debugProducts || []);
  
  // Get unique categories from products
  const categories = allProducts.length > 0 
    ? ['all', ...Array.from(new Set(allProducts.map(product => product.category)))]
    : ['all'];
  console.log('HomePage - Categories found:', categories);

  // Filter products
  const filteredProducts = allProducts.length > 0
    ? allProducts.filter(product => {
        const matchesSearch = !searchQuery || 
                           product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  // Group products by category for display
  const productsByCategory = allProducts.length > 0 && selectedCategory === 'all'
    ? categories
        .filter(category => category !== 'all')
        .map(category => ({
          category,
          products: allProducts.filter(product => product.category === category)
        }))
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newCategory: string) => {
    setSelectedCategory(newCategory);
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        {/* API Status indicator */}
        {apiStatus !== 'connected' && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
            <Typography color="error">
              {apiTestStatus}
            </Typography>
            {apiStatus === 'disconnected' && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đang hiển thị dữ liệu mẫu thay thế. Một số chức năng có thể không hoạt động.
              </Typography>
            )}
          </Paper>
        )}

        {/* Search bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </Box>

        {/* Category tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="product categories"
          >
            {categories.map(category => (
              <Tab 
                key={category} 
                label={category === 'all' ? 'Tất cả' : category} 
                value={category} 
              />
            ))}
          </Tabs>
        </Paper>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message severity="error">{error}</Message>
        ) : allProducts.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6">Không có sản phẩm nào</Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {selectedCategory === 'all' && !searchQuery ? (
              // Display all products by categories
              productsByCategory.length > 0 ? (
                // If we have categories, display by category
                productsByCategory.map(({ category, products }) => (
                  <Box key={category} sx={{ mb: 6 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {category}
                    </Typography>
                    <Grid container spacing={3}>
                      {products.map(product => (
                        <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                          <ProductCard product={product} />
                        </Grid>
                      ))}
                    </Grid>
                    <Divider sx={{ mt: 4 }} />
                  </Box>
                ))
              ) : (
                // Otherwise display all products together
                <Box sx={{ mb: 6 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Tất cả sản phẩm
                  </Typography>
                  <Grid container spacing={3}>
                    {allProducts.map(product => (
                      <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                        <ProductCard product={product} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )
            ) : (
              // Display filtered products
              <>
                <Typography variant="h5" component="h2" gutterBottom>
                  {selectedCategory !== 'all' ? selectedCategory : 'Kết quả tìm kiếm'}
                </Typography>
                <Grid container spacing={3}>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                        <ProductCard product={product} />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Không tìm thấy sản phẩm</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;