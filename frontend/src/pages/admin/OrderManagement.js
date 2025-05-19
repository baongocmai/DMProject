import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Badge, Table, Button, Form, 
  InputGroup, Pagination, Dropdown, Modal, Spinner, Alert,
  Tabs, Tab
} from 'react-bootstrap';
import { 
  FaSearch, FaFilter, FaSortUp, FaSortDown, FaSort,
  FaEye, FaEllipsisV, FaPrint, FaFileExport, FaShippingFast,
  FaTrashAlt, FaBoxOpen, FaClipboard, FaMoneyBill, FaCheck, FaTimes
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  useGetAdminOrdersQuery, 
  useUpdateOrderToDeliveredMutation,
  useUpdateOrderToPaidMutation
} from '../../services/api';
import '../../styles/AdminTheme.css';
import './OrderManagement.css';

const OrderManagement = () => {
  // State for filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    minDate: '',
    maxDate: '',
    minTotal: '',
    maxTotal: '',
    paymentMethod: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  
  // State for order actions
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // API hooks
  const { data: ordersData, isLoading, error, refetch } = useGetAdminOrdersQuery();
  const [updateOrderToDelivered, { isLoading: isUpdatingDelivery }] = useUpdateOrderToDeliveredMutation();
  const [updateOrderToPaid, { isLoading: isUpdatingPayment }] = useUpdateOrderToPaidMutation();
  
  // Sample payment method options
  const paymentMethods = [
    { value: 'credit', label: 'Thẻ tín dụng' },
    { value: 'bank', label: 'Chuyển khoản ngân hàng' },
    { value: 'cod', label: 'Thanh toán khi giao hàng' },
    { value: 'momo', label: 'Ví MoMo' },
    { value: 'zalopay', label: 'ZaloPay' }
  ];
  
  // Order status options
  const statusOptions = [
    { value: 'placed', label: 'Đã đặt hàng', variant: 'info', index: 0 },
    { value: 'confirmed', label: 'Đã xác nhận', variant: 'primary', index: 1 },
    { value: 'processing', label: 'Đang xử lý', variant: 'secondary', index: 2 },
    { value: 'shipping', label: 'Đang giao hàng', variant: 'warning', index: 3 },
    { value: 'delivered', label: 'Đã giao hàng', variant: 'success', index: 4 },
    { value: 'cancelled', label: 'Đã hủy', variant: 'danger', index: 5 }
  ];
  
  // Format currency to VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      minDate: '',
      maxDate: '',
      minTotal: '',
      maxTotal: '',
      paymentMethod: ''
    });
  };
  
  // Apply filters to orders
  const applyFilters = (orders) => {
    if (!orders) return [];
    
    return orders.filter(order => {
      // Search filter (order ID, customer name, email, phone)
      const searchMatch = !filters.search || 
        order._id.toLowerCase().includes(filters.search.toLowerCase()) ||
        (order.user?.name && order.user.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (order.user?.email && order.user.email.toLowerCase().includes(filters.search.toLowerCase())) ||
        (order.shippingAddress?.phone && order.shippingAddress.phone.includes(filters.search));
      
      // Status filter
      const statusMatch = !filters.status || order.status === filters.status;
      
      // Date filters
      const orderDate = new Date(order.createdAt);
      const minDateFilter = filters.minDate ? new Date(filters.minDate) : null;
      const maxDateFilter = filters.maxDate ? new Date(filters.maxDate) : null;
      
      const dateMatch = 
        (!minDateFilter || orderDate >= minDateFilter) &&
        (!maxDateFilter || orderDate <= maxDateFilter);
      
      // Total amount filters
      const totalMatch = 
        (!filters.minTotal || order.totalPrice >= parseFloat(filters.minTotal)) &&
        (!filters.maxTotal || order.totalPrice <= parseFloat(filters.maxTotal));
      
      // Payment method filter
      const paymentMethodMatch = !filters.paymentMethod || order.paymentMethod === filters.paymentMethod;
      
      return searchMatch && statusMatch && dateMatch && totalMatch && paymentMethodMatch;
    });
  };
  
  // Filter orders by tab
  const filterByTab = (orders) => {
    if (!orders) return [];
    
    switch (activeTab) {
      case 'pending':
        return orders.filter(order => ['pending', 'placed'].includes(order.status));
      case 'processing':
        return orders.filter(order => ['confirmed', 'processing'].includes(order.status));
      case 'shipping':
        return orders.filter(order => order.status === 'shipping');
      case 'delivered':
        return orders.filter(order => order.status === 'delivered');
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return orders;
    }
  };
  
  // Sort orders
  const sortOrders = (orders) => {
    if (!orders) return [];
    
    const sortableOrders = [...orders];
    
    if (sortConfig.field) {
      sortableOrders.sort((a, b) => {
        if (sortConfig.field === 'createdAt') {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return sortConfig.direction === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
        }
        
        if (a[sortConfig.field] < b[sortConfig.field]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.field] > b[sortConfig.field]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableOrders;
  };
  
  // Handle sort change
  const handleSort = (field) => {
    let direction = 'asc';
    
    if (sortConfig.field === field) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ field, direction });
  };
  
  // Get sort icon
  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return <FaSort className="ms-1 text-muted" />;
    if (sortConfig.direction === 'asc') return <FaSortUp className="ms-1 text-primary" />;
    return <FaSortDown className="ms-1 text-primary" />;
  };
  
  // Prepare orders with filtering, sorting, and pagination
  const getDisplayedOrders = () => {
    if (!ordersData) return [];
    
    const filteredByTab = filterByTab(ordersData);
    const filtered = applyFilters(filteredByTab);
    const sorted = sortOrders(filtered);
    
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    return {
      orders: sorted.slice(indexOfFirstItem, indexOfLastItem),
      totalItems: sorted.length
    };
  };
  
  // Handle mark as delivered
  const handleMarkAsDelivered = async (orderId) => {
    try {
      await updateOrderToDelivered(orderId).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };
  
  // Handle mark as paid
  const handleMarkAsPaid = async (orderId) => {
    try {
      await updateOrderToPaid({
        id: orderId,
        paymentResult: {
          id: 'ADMIN_MANUAL_' + Date.now(),
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: 'admin@example.com'
        }
      }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };
  
  // Pagination controls
  const totalPages = Math.ceil(getDisplayedOrders().totalItems / itemsPerPage);
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    const statusObj = statusOptions.find(opt => opt.value === status) || 
                      { label: 'Không xác định', variant: 'secondary' };
    
    return (
      <Badge bg={statusObj.variant} className="admin-badge admin-badge-rounded">{statusObj.label}</Badge>
    );
  };
  
  // Get payment method label
  const getPaymentMethodLabel = (method) => {
    const paymentObj = paymentMethods.find(pm => pm.value === method);
    return paymentObj ? paymentObj.label : method;
  };
  
  return (
    <AdminLayout>
      <div className="admin-container">
        <div className="admin-page-header admin-d-flex admin-justify-content-between admin-align-items-center admin-mb-4">
          <div>
            <h1 className="admin-page-title">Quản lý đơn hàng</h1>
            <p className="admin-text-muted">
              Quản lý tất cả đơn hàng và trạng thái giao hàng
            </p>
          </div>
          <Button variant="outline-primary" className="admin-btn">
            <FaFileExport className="admin-me-2" /> Xuất báo cáo
          </Button>
        </div>
        
        <Row>
          <Col lg={12}>
            <Card className="admin-card admin-mb-4">
              <Card.Body className="admin-p-0">
                <Tabs 
                  activeKey={activeTab} 
                  onSelect={tab => setActiveTab(tab)}
                  className="admin-tabs admin-mb-3"
                >
                  <Tab eventKey="all" title="Tất cả đơn hàng" />
                  <Tab eventKey="pending" title="Chờ xác nhận" />
                  <Tab eventKey="processing" title="Đang xử lý" />
                  <Tab eventKey="shipping" title="Đang giao hàng" />
                  <Tab eventKey="delivered" title="Đã giao hàng" />
                  <Tab eventKey="cancelled" title="Đã hủy" />
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="admin-mb-4">
          <Col md={8} xl={9}>
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng, email..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="admin-form-control"
              />
              <Button variant="outline-primary" className="admin-btn">
                <FaSearch />
              </Button>
              <Button 
                variant={showFilters ? "primary" : "outline-secondary"}
                onClick={() => setShowFilters(!showFilters)}
                className="admin-btn"
              >
                <FaFilter /> Lọc
              </Button>
            </InputGroup>
          </Col>
          <Col md={4} xl={3} className="d-flex justify-content-md-end mt-3 mt-md-0">
            <Form.Select 
              className="admin-form-control"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              <option value={10}>10 đơn hàng</option>
              <option value={25}>25 đơn hàng</option>
              <option value={50}>50 đơn hàng</option>
              <option value={100}>100 đơn hàng</option>
            </Form.Select>
          </Col>
        </Row>
        
        {showFilters && (
          <Card className="admin-card admin-mb-4">
            <Card.Body>
              <h5 className="admin-mb-3">Bộ lọc nâng cao</h5>
              <Row>
                <Col md={3}>
                  <Form.Group className="admin-mb-3">
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="admin-form-control"
                    >
                      <option value="">Tất cả trạng thái</option>
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="admin-mb-3">
                    <Form.Label>Phương thức thanh toán</Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={filters.paymentMethod}
                      onChange={handleFilterChange}
                      className="admin-form-control"
                    >
                      <option value="">Tất cả phương thức</option>
                      {paymentMethods.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="admin-mb-3">
                    <Form.Label>Ngày đặt hàng</Form.Label>
                    <div className="admin-d-flex">
                      <Form.Control
                        type="date"
                        name="minDate"
                        value={filters.minDate}
                        onChange={handleFilterChange}
                        className="admin-form-control admin-me-2"
                      />
                      <Form.Control
                        type="date"
                        name="maxDate"
                        value={filters.maxDate}
                        onChange={handleFilterChange}
                        className="admin-form-control"
                      />
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="admin-mb-3">
                    <Form.Label>Giá trị đơn hàng (VND)</Form.Label>
                    <div className="admin-d-flex">
                      <Form.Control
                        type="number"
                        placeholder="Từ"
                        name="minTotal"
                        value={filters.minTotal}
                        onChange={handleFilterChange}
                        className="admin-form-control admin-me-2"
                      />
                      <Form.Control
                        type="number"
                        placeholder="Đến"
                        name="maxTotal"
                        value={filters.maxTotal}
                        onChange={handleFilterChange}
                        className="admin-form-control"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="admin-d-flex admin-justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={clearFilters}
                  className="admin-btn admin-me-2"
                >
                  Xóa bộ lọc
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => refetch()}
                  className="admin-btn"
                >
                  Áp dụng
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
        
        {isLoading ? (
          <div className="text-center admin-py-5">
            <Spinner animation="border" variant="primary" />
            <p className="admin-mt-3">Đang tải dữ liệu đơn hàng...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            Có lỗi xảy ra khi tải dữ liệu đơn hàng. Vui lòng thử lại sau.
          </Alert>
        ) : (
          <>
            <Card className="admin-card">
              <div className="admin-table-responsive">
                <Table className="admin-table admin-table-hover admin-mb-0">
                  <thead>
                    <tr>
                      <th width="120px" onClick={() => handleSort('_id')} style={{ cursor: 'pointer' }}>
                        Mã đơn hàng {getSortIcon('_id')}
                      </th>
                      <th>Khách hàng</th>
                      <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                        Ngày đặt {getSortIcon('createdAt')}
                      </th>
                      <th>Phương thức thanh toán</th>
                      <th onClick={() => handleSort('totalPrice')} style={{ cursor: 'pointer' }}>
                        Tổng tiền {getSortIcon('totalPrice')}
                      </th>
                      <th>Trạng thái</th>
                      <th width="180px">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDisplayedOrders().orders.map((order, index) => (
                      <tr key={order._id}>
                        <td>
                          <span className="admin-order-id">{order._id}</span>
                        </td>
                        <td>
                          <div className="admin-customer-info">
                            <div className="admin-customer-name">
                              {order.user?.name || order.guestInfo?.name || 'Khách hàng'}
                            </div>
                            <div className="admin-customer-email text-muted">
                              {order.user?.email || order.guestInfo?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td>
                          {formatDate(order.createdAt)}
                        </td>
                        <td>
                          {getPaymentMethodLabel(order.paymentMethod)}
                          {order.isPaid && <Badge bg="success" className="ms-2">Đã thanh toán</Badge>}
                        </td>
                        <td className="admin-fw-medium">
                          {formatCurrency(order.totalPrice || 0)}
                        </td>
                        <td>{getStatusBadge(order.status || 'placed')}</td>
                        <td>
                          <div className="admin-order-actions">
                            <Button 
                              variant="light"
                              className="admin-btn admin-btn-icon admin-btn-sm admin-me-1"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailsModal(true);
                              }}
                            >
                              <FaEye />
                            </Button>
                            <Link 
                              to={`/admin/orders/print/${order._id}`} 
                              className="admin-btn admin-btn-icon admin-btn-sm admin-btn-outline admin-me-1"
                              target="_blank"
                            >
                              <FaPrint />
                            </Link>
                            <Dropdown align="end">
                              <Dropdown.Toggle variant="light" size="sm" className="admin-btn admin-btn-icon admin-btn-sm">
                                <FaEllipsisV />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {!order.isDelivered && (
                                  <Dropdown.Item 
                                    onClick={() => handleMarkAsDelivered(order._id)}
                                    className="admin-dropdown-item"
                                    disabled={isUpdatingDelivery}
                                  >
                                    <FaShippingFast className="admin-me-2" />
                                    Đánh dấu đã giao hàng
                                  </Dropdown.Item>
                                )}
                                {!order.isPaid && (
                                  <Dropdown.Item 
                                    onClick={() => handleMarkAsPaid(order._id)}
                                    className="admin-dropdown-item"
                                    disabled={isUpdatingPayment}
                                  >
                                    <FaMoneyBill className="admin-me-2" />
                                    Đánh dấu đã thanh toán
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item 
                                  as={Link} 
                                  to={`/admin/orders/edit/${order._id}`}
                                  className="admin-dropdown-item"
                                >
                                  <FaClipboard className="admin-me-2" />
                                  Cập nhật đơn hàng
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {getDisplayedOrders().orders.length === 0 && (
                <div className="text-center admin-py-5">
                  <FaBoxOpen className="admin-empty-icon" />
                  <h4>Không tìm thấy đơn hàng nào</h4>
                  <p className="text-muted">Hãy thử thay đổi bộ lọc để tìm kiếm đơn hàng</p>
                </div>
              )}
              
              <Card.Footer className="admin-d-flex admin-justify-content-between admin-align-items-center">
                <div className="admin-pagination-info">
                  Hiển thị {getDisplayedOrders().orders.length} / {getDisplayedOrders().totalItems} đơn hàng
                </div>
                
                <Pagination className="admin-pagination admin-mb-0">
                  <Pagination.Prev 
                    disabled={currentPage === 1}
                    onClick={handlePreviousPage}
                  />
                  
                  {currentPage > 2 && (
                    <>
                      <Pagination.Item onClick={() => setCurrentPage(1)}>1</Pagination.Item>
                      {currentPage > 3 && <Pagination.Ellipsis disabled />}
                    </>
                  )}
                  
                  {getPageNumbers().map(number => (
                    <Pagination.Item 
                      key={number} 
                      active={number === currentPage}
                      onClick={() => setCurrentPage(number)}
                    >
                      {number}
                    </Pagination.Item>
                  ))}
                  
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && <Pagination.Ellipsis disabled />}
                      <Pagination.Item onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </Pagination.Item>
                    </>
                  )}
                  
                  <Pagination.Next 
                    disabled={currentPage === totalPages}
                    onClick={handleNextPage}
                  />
                </Pagination>
              </Card.Footer>
            </Card>
          </>
        )}
      </div>
      
      {/* Order Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
        size="lg"
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="admin-mb-4">
                <Col md={6}>
                  <div className="admin-order-detail-section">
                    <h5 className="admin-order-detail-title">Thông tin đơn hàng</h5>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Mã đơn hàng:</div>
                      <div className="admin-order-detail-value admin-fw-bold">
                        {selectedOrder._id}
                      </div>
                    </div>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Ngày đặt hàng:</div>
                      <div className="admin-order-detail-value">
                        {formatDate(selectedOrder.createdAt)}
                      </div>
                    </div>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Trạng thái:</div>
                      <div className="admin-order-detail-value">
                        {getStatusBadge(selectedOrder.status || 'placed')}
                      </div>
                    </div>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Thanh toán:</div>
                      <div className="admin-order-detail-value">
                        {selectedOrder.isPaid ? (
                          <Badge bg="success">Đã thanh toán</Badge>
                        ) : (
                          <Badge bg="warning" text="dark">Chưa thanh toán</Badge>
                        )}
                      </div>
                    </div>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Phương thức:</div>
                      <div className="admin-order-detail-value">
                        {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="admin-order-detail-section">
                    <h5 className="admin-order-detail-title">Thông tin khách hàng</h5>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Tên khách hàng:</div>
                      <div className="admin-order-detail-value">
                        {selectedOrder.user?.name || selectedOrder.guestInfo?.name || 'Không có thông tin'}
                      </div>
                    </div>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Email:</div>
                      <div className="admin-order-detail-value">
                        {selectedOrder.user?.email || selectedOrder.guestInfo?.email || 'Không có thông tin'}
                      </div>
                    </div>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Số điện thoại:</div>
                      <div className="admin-order-detail-value">
                        {selectedOrder.shippingAddress?.phone || 'Không có thông tin'}
                      </div>
                    </div>
                    <div className="admin-order-detail-row">
                      <div className="admin-order-detail-label">Địa chỉ giao hàng:</div>
                      <div className="admin-order-detail-value">
                        {selectedOrder.shippingAddress ? (
                          <>
                            {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, 
                            {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}
                          </>
                        ) : 'Không có thông tin'}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <hr className="admin-my-4" />
              
              <div className="admin-order-detail-section">
                <h5 className="admin-order-detail-title">Sản phẩm đã đặt</h5>
                <div className="admin-table-responsive">
                  <Table className="admin-table admin-table-striped">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>#</th>
                        <th>Sản phẩm</th>
                        <th style={{ width: '100px' }}>Đơn giá</th>
                        <th style={{ width: '80px' }}>SL</th>
                        <th style={{ width: '120px' }} className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems?.map((item, index) => (
                        <tr key={item._id || index}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="admin-product-info">
                              {item.image && (
                                <div className="admin-product-image admin-product-image-sm">
                                  <img src={item.image} alt={item.name} />
                                </div>
                              )}
                              <span className="admin-product-name">{item.name}</span>
                            </div>
                          </td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{item.qty}</td>
                          <td className="text-end">{formatCurrency(item.price * item.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Tạm tính:</strong></td>
                        <td className="text-end">{formatCurrency(selectedOrder.itemsPrice || selectedOrder.totalPrice)}</td>
                      </tr>
                      {selectedOrder.shippingPrice > 0 && (
                        <tr>
                          <td colSpan="4" className="text-end">Phí vận chuyển:</td>
                          <td className="text-end">{formatCurrency(selectedOrder.shippingPrice)}</td>
                        </tr>
                      )}
                      {selectedOrder.taxPrice > 0 && (
                        <tr>
                          <td colSpan="4" className="text-end">Thuế:</td>
                          <td className="text-end">{formatCurrency(selectedOrder.taxPrice)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Tổng cộng:</strong></td>
                        <td className="text-end admin-fw-bold">{formatCurrency(selectedOrder.totalPrice)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDetailsModal(false)}
            className="admin-btn"
          >
            Đóng
          </Button>
          
          {selectedOrder && !selectedOrder.isDelivered && (
            <Button 
              variant="success" 
              onClick={() => {
                handleMarkAsDelivered(selectedOrder._id);
                setShowDetailsModal(false);
              }}
              className="admin-btn"
              disabled={isUpdatingDelivery}
            >
              <FaShippingFast className="admin-me-1" /> 
              {isUpdatingDelivery ? 'Đang cập nhật...' : 'Đánh dấu đã giao hàng'}
            </Button>
          )}
          
          {selectedOrder && !selectedOrder.isPaid && (
            <Button 
              variant="primary" 
              onClick={() => {
                handleMarkAsPaid(selectedOrder._id);
                setShowDetailsModal(false);
              }}
              className="admin-btn"
              disabled={isUpdatingPayment}
            >
              <FaMoneyBill className="admin-me-1" /> 
              {isUpdatingPayment ? 'Đang cập nhật...' : 'Đánh dấu đã thanh toán'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default OrderManagement; 