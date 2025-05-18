import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Carousel } from 'react-bootstrap';
import { useGetProductsQuery, useGetRecommendedProductsQuery } from '../services/api';
import Layout from '../components/Layout';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import DealOfTheDay from '../components/DealOfTheDay';
import CartDrawer from '../components/CartDrawer';
import AccountDrawer from '../components/AccountDrawer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ApiErrorBoundary from '../components/ApiErrorBoundary';
import { FaArrowRight } from 'react-icons/fa';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');
  const searchFilter = queryParams.get('search');
  const drawerParam = queryParams.get('drawer');
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const [filters, setFilters] = useState({
    keyword: searchFilter || '',
    category: categoryFilter || '',
    page: 1,
  });

  // Check if we need to open any drawers based on URL params
  useEffect(() => {
    if (drawerParam === 'cart') {
      setIsCartOpen(true);
      // Remove the drawer param from URL after opening
      navigate('/', { replace: true });
    } else if (drawerParam === 'account') {
      setIsAccountOpen(true);
      // Remove the drawer param from URL after opening
      navigate('/', { replace: true });
    }
  }, [drawerParam, navigate]);

  // Update filters when URL params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      keyword: searchFilter || '',
      category: categoryFilter || '',
    }));
  }, [searchFilter, categoryFilter]);

  // Fetch products based on filters
  const { data: productsData, error: productsError, isLoading: productsLoading } = useGetProductsQuery(filters);
  
  // Fetch recommended products
  const { data: recommendationsData } = useGetRecommendedProductsQuery(undefined, {
    // Skip recommendation API call if we're using search or category filters
    skip: !!filters.keyword || !!filters.category,
  });
  
  // Create a stable deal object that doesn't change on every render
  const dealOfDay = useMemo(() => {
    const dayProduct = productsData?.products?.find(p => p.dealOfTheWeek) || null;
    if (dayProduct) {
      return {
        ...dayProduct,
        expiresAt: dayProduct.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }
    return null; // DealOfTheDay component will use its default deal
  }, [productsData?.products]);

  // Debug info
  useEffect(() => {
    console.log('Products data from API:', productsData);
    console.log('Recommendations data from API:', recommendationsData);
  }, [productsData, recommendationsData]);
  
  // Extract products array from API response or use empty array as fallback
  const products = productsData?.products || [];
  
  // Get recommended products if available, otherwise use regular products
  const recommendedProducts = recommendationsData?.products || [];
  const displayProducts = filters.keyword || filters.category ? products : 
                         (recommendedProducts.length > 0 ? recommendedProducts : products);

  // Hero banners data
  const heroBanners = [
    {
      id: 1,
      title: "Summer Collection",
      subtitle: "New arrivals for the season",
      description: "Discover our latest collection with up to 40% off selected items.",
      buttonText: "Shop Now",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop",
      link: "/category/summer"
    },
    {
      id: 2,
      title: "Premium Electronics",
      subtitle: "The latest technology",
      description: "Explore cutting-edge gadgets and electronics at unbeatable prices.",
      buttonText: "Discover More",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=1200&auto=format&fit=crop",
      link: "/category/electronics"
    },
    {
      id: 3,
      title: "Home Essentials",
      subtitle: "Transform your space",
      description: "Find everything you need to make your house feel like home.",
      buttonText: "View Collection",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
      link: "/category/home"
    }
  ];

  return (
    <Layout>
      {/* Cart and Account Drawers */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AccountDrawer isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
      
      {/* Hero Banner Carousel */}
      {!filters.keyword && !filters.category && (
        <div className="hero-section">
          <Carousel fade interval={5000} pause="hover">
            {heroBanners.map(banner => (
              <Carousel.Item key={banner.id}>
                <div 
                  className="hero-banner" 
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${banner.image})`,
                  }}
                >
                  <Container>
                    <Row className="hero-content">
                      <Col md={7} lg={6}>
                        <div className="banner-content">
                          <p className="banner-subtitle">{banner.subtitle}</p>
                          <h1 className="banner-title">{banner.title}</h1>
                          <p className="banner-description">{banner.description}</p>
                          <Button variant="light" size="lg" href={banner.link} className="banner-button">
                            {banner.buttonText} <FaArrowRight className="ms-2" />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}
      
      <Container className="py-5">
        {/* Categories Section */}
        <CategoryList />
      
        {/* Deal of the Day Section */}
        <DealOfTheDay deal={dealOfDay} />
      
        {/* Search Results Header */}
        {(filters.keyword || filters.category) && (
          <div className="search-results-header">
            <h2>
              {filters.keyword ? `Search Results for "${filters.keyword}"` : ''}
              {filters.category ? `Category: ${filters.category}` : ''}
            </h2>
          </div>
        )}
        
        {/* Products Section */}
        <div className="products-section py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title">Popular Products</h2>
            <Button variant="outline-primary" href="/products" className="view-all-btn">View All</Button>
          </div>
        
        <ApiErrorBoundary
          isLoading={productsLoading}
          error={productsError}
          loadingComponent={<Loader />}
        >
          <>
            {productsError && (
              <Message variant="error">
                Error loading products: {JSON.stringify(productsError)}
              </Message>
            )}
            
              <Row className="product-grid g-3">
                {displayProducts.map((product) => (
                  <div key={product._id} className="col-5-products">
                    <ProductCard product={product} />
                  </div>
                ))}
              </Row>
            
            {displayProducts.length === 0 && (
              <Message>No products found. Try different filters.</Message>
            )}
          </>
        </ApiErrorBoundary>
      </div>

        {/* Featured Section */}
        {!filters.keyword && !filters.category && (
          <div className="featured-section py-5">
            <Row>
              <Col md={6} className="mb-4">
                <div className="featured-card" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop')" }}>
                  <div className="featured-content">
                    <h3>New Arrivals</h3>
                    <p>Check out our latest products</p>
                    <Button variant="light" href="/new-arrivals">Shop Now</Button>
                  </div>
                </div>
              </Col>
              <Col md={6} className="mb-4">
                <div className="featured-card" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop')" }}>
                  <div className="featured-content">
                    <h3>Special Offers</h3>
                    <p>Up to 50% off on selected items</p>
                    <Button variant="light" href="/special-offers">View Offers</Button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Recommendations Section - show only if available and not filtering */}
        {recommendedProducts.length > 0 && !filters.keyword && !filters.category && (
          <div className="recommendations-section py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title">Recommended For You</h2>
              <Button variant="outline-primary" href="/recommendations" className="view-all-btn">View All</Button>
            </div>
            <Row className="product-grid g-3">
              {recommendedProducts.slice(0, 5).map((product) => (
                <div key={product._id} className="col-5-products">
                  <ProductCard product={product} />
                </div>
              ))}
            </Row>
          </div>
        )}
        
        {/* Newsletter Subscription */}
        {!filters.keyword && !filters.category && (
          <div className="newsletter-section py-5 my-5 text-center">
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <h3>Join Our Newsletter</h3>
                <p className="mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                <div className="d-flex">
                  <input type="email" className="form-control me-2" placeholder="Your email address" />
                  <Button variant="primary">Subscribe</Button>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default HomePage; 