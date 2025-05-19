import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaClock, FaShoppingCart } from 'react-icons/fa';

const DealOfTheDay = ({ deal }) => {
  // If no deal is provided, use a default one
  const defaultDeal = {
    _id: 'deal123',
    name: 'Premium Headphones - Limited Offer',
    description: 'Top quality noise-cancelling headphones with exceptional sound clarity. Ergonomic design for maximum comfort during extended use.',
    price: 129.99,
    originalPrice: 199.99,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };

  const dealToShow = deal || defaultDeal;
  
  // Calculate discount percentage if not provided
  const discountPercentage = dealToShow.discount || 
    Math.round(((dealToShow.originalPrice - dealToShow.price) / dealToShow.originalPrice) * 100);
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Store the expiration time as a ref to avoid recalculating it on every render
  const expirationTimeRef = useRef(new Date(dealToShow.expiresAt).getTime());
  
  // Define calculateTimeLeft outside useEffect to avoid recreating it on every render
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const difference = expirationTimeRef.current - now;
    
    if (difference > 0) {
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      // Only update state if values have changed
      setTimeLeft(prev => {
        if (prev.hours !== hours || prev.minutes !== minutes || prev.seconds !== seconds) {
          return { hours, minutes, seconds };
        }
        return prev;
      });
    } else {
      // Deal has expired, set to zero (using functional update to avoid dependency)
      setTimeLeft(prev => {
        if (prev.hours !== 0 || prev.minutes !== 0 || prev.seconds !== 0) {
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return prev;
      });
    }
  }, []);
  
  useEffect(() => {
    // Update expiration time ref when the deal changes
    expirationTimeRef.current = new Date(dealToShow.expiresAt).getTime();
    
    // Initial calculation
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [dealToShow.expiresAt, calculateTimeLeft]);
  
  // Format time units with leading zeros
  const formatTimeUnit = (unit) => {
    return unit < 10 ? `0${unit}` : unit;
  };

  return (
    <div className="deals-section py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="section-title">Deal hot hôm nay</h2>
        <div className="countdown-timer">
          <FaClock className="me-2" />
          <span className="countdown-text">
            Kết thúc vào: {formatTimeUnit(timeLeft.hours)}:{formatTimeUnit(timeLeft.minutes)}:{formatTimeUnit(timeLeft.seconds)}
          </span>
        </div>
      </div>
      
      <Card className="deal-of-day-card">
        <Row className="g-0">
          <Col md={5} className="deal-image-col">
            <div className="deal-image-container">
              <img 
                src={dealToShow.image} 
                alt={dealToShow.name} 
                className="deal-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/deal-placeholder.png';
                }}
              />
              <Badge bg="danger" className="deal-discount-badge">
                -{discountPercentage}%
              </Badge>
            </div>
          </Col>
          <Col md={7}>
            <Card.Body className="deal-content">
              <Badge bg="warning" text="dark" className="limited-offer-badge mb-3">
                Ưu đãi giới hạn
              </Badge>
              <h3 className="deal-title">{dealToShow.name}</h3>
              <p className="deal-description">{dealToShow.description}</p>
              <div className="deal-price mb-4">
                <span className="current-price">${dealToShow.price.toFixed(2)}</span>
                <span className="original-price">${dealToShow.originalPrice.toFixed(2)}</span>
                <span className="saving-amount">
                  Tiết kiệm: ${(dealToShow.originalPrice - dealToShow.price).toFixed(2)}
                </span>
              </div>
              <div className="deal-actions">
                <Button 
                  as={Link} 
                  to={`/product/${dealToShow._id}`} 
                  variant="primary" 
                  className="view-deal-btn"
                >
                  Xem chi tiết
                </Button>
                <Button variant="success" className="add-cart-btn ms-3">
                  <FaShoppingCart className="me-2" /> Thêm vào giỏ hàng
                </Button>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DealOfTheDay; 