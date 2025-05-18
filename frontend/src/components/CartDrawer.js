import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Spinner } from 'react-bootstrap';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { 
  removeFromCart, 
  updateCartQuantity, 
  calculatePrices 
} from '../redux/slices/cartSlice';
import { formatPrice, formatImageUrl } from '../utils/productHelpers';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation } from '../services/api';
import SlidingDrawer from './SlidingDrawer';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items, itemsPrice, shippingPrice, totalPrice } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // API integration
  const { data: cartData, error: cartError, isLoading, refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true
  });
  
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();

  // Calculate totals whenever cart items change
  useEffect(() => {
    dispatch(calculatePrices());
  }, [items, dispatch]);

  // Sync cart with backend when drawer opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refetch();
    }
  }, [isOpen, isAuthenticated, refetch]);

  const handleQuantityUpdate = async (id, newQuantity) => {
    if (newQuantity > 0) {
      // Update in local Redux store first for immediate UI feedback
      dispatch(updateCartQuantity({ id, quantity: newQuantity }));
      
      // If authenticated, also update in backend
      if (isAuthenticated) {
        try {
          await updateCartItem({ id, quantity: newQuantity });
        } catch (error) {
          console.error('Error updating cart item:', error);
          // Revert on failure
          refetch();
        }
      }
    }
  };

  const handleRemoveItem = async (id) => {
    // Remove from local Redux store first
    dispatch(removeFromCart(id));
    
    // If authenticated, also remove from backend
    if (isAuthenticated) {
      try {
        await removeCartItem(id);
      } catch (error) {
        console.error('Error removing cart item:', error);
        // Revert on failure
        refetch();
      }
    }
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/payment');
      onClose();
    } else {
      navigate('/login?redirect=payment');
      onClose();
    }
  };

  return (
    <SlidingDrawer isOpen={isOpen} onClose={onClose} title="Your Cart" position="right">
      {isLoading ? (
        <div className="drawer-loading">
          <Spinner animation="border" variant="primary" />
          <p>Loading your cart...</p>
        </div>
      ) : cartError ? (
        <div className="drawer-error">
          <p>Error loading your cart. Please try again.</p>
          <Button 
            variant="outline-primary" 
            onClick={refetch}
          >
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-message">
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Button 
              variant="primary" 
              onClick={() => {
                navigate('/');
                onClose();
              }}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="cart-drawer-items">
            {items.map((item) => (
              <div key={item._id} className="cart-drawer-item">
                <div className="cart-drawer-item-image">
                  <img 
                    src={formatImageUrl(item.image)} 
                    alt={item.name} 
                    onClick={() => {
                      navigate(`/product/${item._id}`);
                      onClose();
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                
                <div className="cart-drawer-item-details">
                  <h4 
                    className="cart-drawer-item-title"
                    onClick={() => {
                      navigate(`/product/${item._id}`);
                      onClose();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.name}
                  </h4>
                  <div className="cart-drawer-item-price">{formatPrice(item.price)}</div>
                  
                  <div className="cart-drawer-item-actions">
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={isRemoving}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="cart-drawer-item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-drawer-summary">
            <div className="summary-item">
              <span>Order Price</span>
              <span>{formatPrice(itemsPrice)}</span>
            </div>
            
            <div className="summary-item">
              <span>Shipping Cost ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
              <span>{formatPrice(shippingPrice)}</span>
            </div>
            
            <div className="summary-item summary-total">
              <span>Total:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            
            <div className="cart-drawer-buttons">
              <Button 
                variant="primary" 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isUpdating || isRemoving}
              >
                {isUpdating || isRemoving ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" className="me-2" />
                    Processing...
                  </>
                ) : (
                  'Checkout'
                )}
              </Button>
              <Button 
                variant="outline-secondary" 
                className="continue-btn"
                onClick={() => {
                  navigate('/');
                  onClose();
                }}
                disabled={isUpdating || isRemoving}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </>
      )}
    </SlidingDrawer>
  );
};

export default CartDrawer; 