import React, { useState, useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch orders from API
    // This is a placeholder - replace with actual API call
    setTimeout(() => {
      setOrders([
        { 
          id: '1001', 
          user: 'John Doe', 
          date: '2023-09-15', 
          total: 125.99, 
          status: 'Delivered', 
          paymentMethod: 'Credit Card',
          items: 3
        },
        { 
          id: '1002', 
          user: 'Jane Smith', 
          date: '2023-09-18', 
          total: 89.50, 
          status: 'Processing', 
          paymentMethod: 'PayPal',
          items: 2
        },
        { 
          id: '1003', 
          user: 'Mike Johnson', 
          date: '2023-09-20', 
          total: 210.75, 
          status: 'Shipped', 
          paymentMethod: 'Credit Card',
          items: 5
        },
        { 
          id: '1004', 
          user: 'Sarah Williams', 
          date: '2023-09-21', 
          total: 45.00, 
          status: 'Pending', 
          paymentMethod: 'Bank Transfer',
          items: 1
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status) => {
    let variant;
    switch(status.toLowerCase()) {
      case 'delivered':
        variant = 'success';
        break;
      case 'shipped':
        variant = 'info';
        break;
      case 'processing':
        variant = 'primary';
        break;
      case 'pending':
        variant = 'warning';
        break;
      case 'cancelled':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="order-list">
        <div className="order-list-header">
          <h1>Orders Management</h1>
        </div>

        {loading ? (
          <div className="text-center my-5">Loading orders...</div>
        ) : (
          <Table striped bordered hover responsive className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user}</td>
                  <td>{order.date}</td>
                  <td>{order.items}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <Link to={`/admin/orders/${order.id}`}>
                      <Button variant="info" size="sm">
                        <FaEye /> View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderList; 