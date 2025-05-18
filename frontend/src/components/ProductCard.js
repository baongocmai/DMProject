import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAddToCartMutation, useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from '../services/api';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product, inWishlist = false }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const { data: wishlistItems = [] } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated
  });
  
  // Check if product is in wishlist
  const isInWishlist = inWishlist || wishlistItems.some(item => item._id === product._id);
  
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();
  
  const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

  // Format the price with commas
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      await addToCart({ 
        productId: product._id,
        quantity: 1
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };
  
  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };
  
  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star-filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star-half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-empty" />);
      }
    }
    
    return stars;
  };

  return (
    <Card className="product-card h-100">
      {product.discount > 0 && (
        <div className="discount-badge">
          <Badge bg="danger">-{product.discount}%</Badge>
        </div>
      )}
      
      {isAuthenticated && (
        <Button
          variant="link"
          className={`wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}`}
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
        >
          {isInWishlist ? <FaHeart /> : <FaRegHeart />}
        </Button>
      )}
      
      <Link to={`/product/${product._id}`} className="product-link">
        <div className="product-image-container">
          <Card.Img 
            variant="top" 
            src={product.image} 
            alt={product.name} 
            className="product-image"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/images/placeholder.png';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </Link>
      
      <Card.Body className="d-flex flex-column">
        <Link to={`/product/${product._id}`} className="product-link">
          <Card.Title className="product-title">{product.name}</Card.Title>
        </Link>
        
        <div className="my-2 product-rating">
          {renderStars(product.rating)}
          <span className="rating-count">({product.numReviews})</span>
        </div>
        
        <div className="product-price-row mt-auto">
          <div className="product-price">
            {product.discount > 0 && (
              <span className="original-price">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="current-price">
              {formatPrice(product.price * (1 - product.discount / 100))}
            </span>
          </div>
          <Button 
            variant="primary" 
            className="cart-button"
            onClick={handleAddToCart}
            disabled={isAddingToCart || !product.countInStock}
            title="Add to Cart"
          >
            {isAddingToCart ? '...' : <FaShoppingCart />}
          </Button>
        </div>
        
        {product.countInStock === 0 && (
          <Badge bg="secondary" className="out-of-stock-badge mt-2">
            Out of Stock
          </Badge>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductCard; 