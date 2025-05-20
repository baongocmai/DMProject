import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button, Badge, Form, Tab, Tabs, Alert } from 'react-bootstrap';
import { FaStar, FaRegStar, FaMinus, FaPlus, FaArrowLeft, FaIceCream, FaFire, FaShoppingCart, FaHeart, FaShare, FaTruck, FaUndo, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import { useGetProductByIdQuery, useAddProductReviewMutation } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/productHelpers';
import { formatError } from '../utils/errorHandler';
import Layout from '../components/Layout';
import LoadingPage from '../components/LoadingPage';
import './ProductDetailPage.css'; // We will create this CSS file

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedOption, setSelectedOption] = useState('CHAI');
  const [userRating, setUserRating] = useState(4);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  // Get the current user from Redux store (if authentication is implemented)
  const { user } = useSelector(state => state.auth || { user: null });
  
  const { data: product, error, isLoading, refetch } = useGetProductByIdQuery(id, {
    // Poll for updates every 30 seconds
    pollingInterval: 30000,
  });
  
  const [addProductReview, { isLoading: isSubmittingReview }] = useAddProductReviewMutation();

  // Move useEffect hooks to the top level, before any conditional returns
  // Refresh product data on mount and every minute
  useEffect(() => {
    // Fetch immediately on mount
    refetch();
    
    // Setup interval to refetch every minute
    const intervalId = setInterval(() => {
      refetch();
    }, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Reset the success message after 5 seconds
  useEffect(() => {
    let timer;
    if (reviewSuccess) {
      timer = setTimeout(() => {
        setReviewSuccess(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [reviewSuccess]);

  // Handle conditional rendering after all hook calls
  if (isLoading) {
    return <LoadingPage message="Đang tải thông tin sản phẩm..." />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h3>Đã có lỗi khi tải thông tin sản phẩm.</h3>
          <Button 
            variant="outline-primary" 
            className="mt-3"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="me-2" /> Quay lại
          </Button>
        </div>
      </Container>
    );
  }

  if (!product) {
    return <LoadingPage message="Đang tải thông tin sản phẩm..." />;
  }

  // Use product directly, no fallback to sample data
  const productData = product;

  // Calculate percentage for each star rating
  const calculateRatingPercentage = (star) => {
    if (!productData.reviews || productData.reviews.length === 0) return 0;
    
    const totalReviews = productData.reviews.length;
    const starsCount = productData.reviews.filter(review => review.rating === star).length;
    
    return Math.round((starsCount / totalReviews) * 100);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    
    // Show loading state for 1.5 seconds to simulate adding to cart
    setTimeout(() => {
      dispatch(addToCart({
        _id: productData._id,
        name: productData.name,
        image: productData.image,
        price: productData.salePrice || productData.price,
        originalPrice: productData.price,
        countInStock: productData.countInStock,
        quantity
      }));
      setAddedToCart(false);
      
      // Refresh product data after adding to cart to update stock count
      refetch();
    }, 1500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    
    try {
      // Format review data according to the API's expected structure
      const review = {
        rating: userRating,
        comment: reviewComment,
      };
      
      // Call the mutation with the correct format (id and review object)
      await addProductReview({
        id: productData._id,
        review
      }).unwrap();
      
      // Show success message and reset form
      setReviewSuccess(true);
      setReviewComment('');
      setUserRating(5);
      
      // Refresh the product data to get updated reviews
      refetch();
      
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewError('Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
    }
  };
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star-filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="star-half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-empty" />);
      }
    }
    
    return stars;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <Layout>
      {addedToCart && <LoadingPage message="Đang thêm vào giỏ hàng..." />}
      
      <div className="product-detail-page">
        {/* Breadcrumb */}
        <Container className="py-3">
          <div className="product-breadcrumb">
            <Link to="/">Trang chủ</Link> / 
            <Link to={`/category/${productData.category}`}> {productData.category}</Link> / 
            <span> {productData.name}</span>
          </div>
        </Container>
        
        {/* Product Main Info Section */}
        <Container className="product-detail-container">
          <div className="product-card-modern">
            <div className="product-image-section">
              <img 
                src={productData.image} 
                alt={productData.name} 
                className="product-img" 
              />
            </div>
            
            <div className="product-info-section">
              <h1 className="product-title">{productData.name}</h1>
                
              <div className="price-tag">
                <span className="price-amount">{formatPrice(productData.price)}</span>
              </div>
                  
              <div className="product-description">
                <p>{productData.description || "Sản phẩm chất lượng cao, đảm bảo an toàn vệ sinh thực phẩm."}</p>
              </div>
              
              <div className="delivery-info">
                <FaTruck className="delivery-icon" />
                <span>Miễn phí giao hàng cho đơn từ 300.000đ</span>
              </div>
              
              <div className="divider"></div>
              
              <div className="quantity-control-wrap">
                <span className="control-label">Số lượng</span>
                <div className="quantity-buttons">
                  <button 
                    className="qty-btn minus-btn"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                    <FaMinus />
                  </button>
                    <input
                      type="number"
                    className="qty-input"
                      value={quantity}
                      min="1"
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    />
                  <button 
                    className="qty-btn plus-btn"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                    <FaPlus />
                  </button>
            </div>
          </div>
          
              <button 
                className="add-to-cart-button"
                    onClick={handleAddToCart}
                    disabled={productData.stock === 0}
                  >
                <FaShoppingCart className="cart-icon" />
                <span className="btn-text">THÊM VÀO GIỎ HÀNG</span>
              </button>
                </div>
              </div>
        </Container>
        
        {/* Product Details Tabs */}
        <Container className="product-details mb-5">
          <Tabs
            id="product-details-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="description" title="Mô tả sản phẩm">
              <div className="tab-content-wrapper">
                <p>{productData.description}</p>
                
                <div className="product-highlights">
                  <h4>Điểm nổi bật</h4>
                  <ul>
                    <li>Sản phẩm sữa tươi tiệt trùng chất lượng cao</li>
                    <li>Cung cấp nhiều dưỡng chất và vitamin thiết yếu</li>
                    <li>Lốc 4 hộp tiện lợi, dễ bảo quản và sử dụng</li>
                    <li>Thích hợp cho mọi đối tượng, đặc biệt là trẻ em đang phát triển</li>
                  </ul>
                </div>
              </div>
            </Tab>
            
            <Tab eventKey="specifications" title="Thông số kỹ thuật">
              <div className="tab-content-wrapper">
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <td className="spec-name">Thương hiệu</td>
                      <td className="spec-value">Nutimilk</td>
                    </tr>
                    <tr>
                      <td className="spec-name">Dung tích</td>
                      <td className="spec-value">4 hộp x 180ml</td>
                    </tr>
                    <tr>
                      <td className="spec-name">Loại sữa</td>
                      <td className="spec-value">Sữa tươi tiệt trùng</td>
                    </tr>
                    <tr>
                      <td className="spec-name">Thành phần</td>
                      <td className="spec-value">Sữa tươi, đường, vitamin A, D3, B1, B2</td>
                    </tr>
                    <tr>
                      <td className="spec-name">Xuất xứ</td>
                      <td className="spec-value">Việt Nam</td>
                      </tr>
                  </tbody>
                </table>
              </div>
            </Tab>
            
            <Tab eventKey="reviews" title={`Đánh giá (${productData.numReviews || 0})`}>
              <div className="tab-content-wrapper">
                <div className="reviews-summary">
                  <div className="overall-rating">
                    <div className="rating-number">{productData.rating?.toFixed(1) || 'N/A'}</div>
                    <div className="rating-stars">
                      {renderStars(productData.rating || 0)}
                    </div>
                    <div className="total-reviews">
                      {productData.numReviews || 0} đánh giá
                    </div>
                  </div>
                  
                  <div className="rating-bars">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="rating-bar-item">
                        <div className="star-label">{star} sao</div>
                        <div className="rating-bar">
                          <div 
                            className="rating-fill" 
                            style={{ 
                              width: `${calculateRatingPercentage(star)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="rating-percent">{calculateRatingPercentage(star)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Reviews List */}
                <div className="reviews-list">
                  <h4>Đánh giá từ khách hàng</h4>
                  
                  {productData.reviews && productData.reviews.length > 0 ? (
                    productData.reviews.map((review, index) => (
                      <div key={index} className="review-item">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                            <div className="avatar-placeholder">{review.name.charAt(0)}</div>
                        </div>
                        <div className="reviewer-details">
                            <div className="reviewer-name">{review.name}</div>
                            <div className="review-date">{formatDate(review.createdAt)}</div>
                        </div>
                      </div>
                      <div className="review-content">
                        <div className="review-rating">
                            {renderStars(review.rating)}
                        </div>
                        <div className="review-text">
                            <p>{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  )}
                    </div>
                
                {/* Add Review Form */}
                  <div className="add-review">
                    <h4>Thêm đánh giá của bạn</h4>
                  <div className="review-form-underline"></div>
                  
                  {reviewSuccess && (
                    <Alert variant="success" className="mb-4">
                      Đánh giá của bạn đã được gửi thành công. Cảm ơn bạn đã đánh giá!
                    </Alert>
                  )}
                  
                  {reviewError && (
                    <Alert variant="danger" className="mb-4">
                      {reviewError}
                    </Alert>
                  )}
                  
                  <Form className="review-form" onSubmit={handleReviewSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label>Đánh giá của bạn</Form.Label>
                        <div className="rating-selector">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar 
                              key={star} 
                            className={`rating-star ${userRating >= star ? 'active' : ''}`}
                            onClick={() => setUserRating(star)}
                            />
                          ))}
                        </div>
                      </Form.Group>
                      
                    <Form.Group className="mb-4">
                        <Form.Label>Nhận xét</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={4} 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        className="review-textarea"
                        required
                        />
                      {reviewComment === '' && 
                        <div className="field-validation-message">
                          Please fill out this field.
                        </div>
                      }
                      </Form.Group>
                      
                    <Button 
                      variant="danger" 
                      type="submit" 
                      className="submit-review-btn"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? (
                        <>
                          <FaSpinner className="spinner me-2" /> ĐANG GỬI...
                        </>
                      ) : (
                        'GỬI ĐÁNH GIÁ'
                      )}
                      </Button>
                    </Form>
          </div>
        </div>
            </Tab>
          </Tabs>
        </Container>
        
        {/* Related Products */}
        <Container className="related-products mb-5">
          <h3 className="section-title">Sản phẩm liên quan</h3>
          <Row>
            {productData.relatedProducts && productData.relatedProducts.map((item) => (
              <Col md={4} key={item._id}>
                <div className="related-product-card">
                  <Link to={`/product/${item._id}`} className="product-link">
                    <div className="related-product-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="related-product-info">
                      <h4 className="related-product-title">{item.name}</h4>
                      <div className="related-product-price">{formatPrice(item.price)}</div>
                    </div>
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </Layout>
  );
};

export default ProductDetailPage; 