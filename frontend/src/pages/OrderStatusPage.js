import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../services/api';
import { FaClipboardCheck, FaClock, FaShippingFast, FaBox, FaHourglassHalf } from 'react-icons/fa';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import Message from '../components/Message';

const OrderStatusPage = () => {
  const { id } = useParams();
  const { data: order, error, isLoading, refetch } = useGetOrderByIdQuery(id);

  // Refetch order data every 30 seconds to update status
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Sample order data (to be replaced with actual API data)
  const sampleOrder = {
    _id: id || '43554645',
    orderItems: [
      {
        _id: 'item1',
        name: 'Turkish Steak',
        image: '/images/product-small-placeholder.png',
        price: 25,
        quantity: 2,
      },
      {
        _id: 'item2',
        name: 'Salmon',
        image: '/images/product-small-placeholder.png',
        price: 30,
        quantity: 1,
      },
    ],
    shippingAddress: {
      address: 'Old Student House 56 Street',
    },
    paymentMethod: 'credit',
    itemsPrice: 80,
    shippingPrice: 14,
    totalPrice: 94,
    isPaid: true,
    isDelivered: false,
    status: 'processing',
    createdAt: '2023-07-24T08:25:00Z',
    statusEvents: [
      {
        status: 'placed',
        time: '2023-07-24T08:25:00Z',
        isCompleted: true,
      },
      {
        status: 'confirmed',
        time: '2023-07-24T08:54:00Z',
        isCompleted: true,
      },
      {
        status: 'shipping',
        time: '2023-07-24T09:30:00Z',
        isCompleted: false,
      },
      {
        status: 'delivered',
        time: null,
        isCompleted: false,
      },
    ],
    shipper: {
      name: 'Jazzy Jr',
      phone: '+1 24123 45353 2342',
    },
  };

  // Use sample data if API data isn't available yet
  const orderData = order || sampleOrder;

  // Prepare status events if missing from API response
  const statusEvents = orderData.statusEvents || [
    { status: 'placed', time: orderData.createdAt, isCompleted: true },
    { status: 'confirmed', time: null, isCompleted: false },
    { status: 'shipping', time: null, isCompleted: false },
    { status: 'delivered', time: null, isCompleted: false }
  ];

  // Get current status
  const getCurrentStatus = () => {
    if (!orderData) return 'placed';
    
    const currentEvent = statusEvents.find(event => !event.isCompleted);
    return currentEvent ? currentEvent.status : 'delivered';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Đang chờ xử lý';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get estimated delivery time
  const getEstimatedTime = () => {
    if (orderData.isDelivered) return 'Đã giao hàng';
    
    const deliveryEvent = statusEvents.find(event => event.status === 'delivered');
    if (deliveryEvent && deliveryEvent.time) {
      return formatDate(deliveryEvent.time);
    }
    
    return 'Dự kiến 30 phút nữa';
  };

  // Render a status item safely
  const renderStatusItem = (index, icon, title) => {
    const event = statusEvents[index] || { time: null, isCompleted: false };
    return (
      <div className="status-item">
        <div className={`status-icon ${event.isCompleted ? 'active' : ''}`}>
          {icon}
        </div>
        {event.isCompleted && index < statusEvents.length - 1 && <div className="status-line"></div>}
        <div className="status-info">
          <h3>{title}</h3>
          <p className="status-time">{formatDate(event.time)}</p>
          {index === 0 && event.isCompleted && <p>**** **** **** 5454</p>}
          {index === 2 && (event.isCompleted || getCurrentStatus() === 'shipping') && orderData.shipper && (
            <>
              <p>{orderData.shipper.name || 'Đang giao hàng'}</p>
              <p>{orderData.shipper.phone || 'Đang cập nhật'}</p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="order-status-container">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="error">
            {error?.data?.message || 'Không thể tải thông tin đơn hàng'}
          </Message>
        ) : (
          <>
            <div className="order-number">
              <h1>Trạng thái đơn hàng</h1>
              <p>#{orderData._id}</p>
            </div>
            
            <div className="status-timeline">
              {/* Order Placed Status */}
              {renderStatusItem(0, <FaClipboardCheck />, "Đã đặt hàng")}
              
              {/* Order Confirmed Status */}
              {renderStatusItem(1, <FaClock />, "Đã xác nhận")}
              
              {/* Shipping Status */}
              {renderStatusItem(2, <FaShippingFast />, "Đang giao hàng")}
              
              {/* Delivery Status */}
              {renderStatusItem(3, <FaBox />, "Giao hàng")}
              
              {/* Ready Status */}
              <div className="status-item">
                <div className={`status-icon ${orderData.isDelivered ? 'active' : ''}`}>
                  <FaHourglassHalf />
                </div>
                <div className="status-info">
                  <h3>Tình trạng</h3>
                  <p className="status-time">{getEstimatedTime()}</p>
                </div>
              </div>
            </div>
            
            <div className="order-status-actions">
              <Link to="/" className="btn-primary">
                Trở về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default OrderStatusPage; 