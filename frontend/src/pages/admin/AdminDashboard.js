import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Tabs, Tab, Badge } from 'react-bootstrap';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  FaUsers, FaShoppingBag, FaMoneyBillWave, FaShoppingCart, 
  FaChartLine, FaRegCalendarAlt, FaRegBell
} from 'react-icons/fa';
import { 
  useGetDashboardStatsQuery,
  useGetProductAnalyticsQuery,
  useGetUserAnalyticsQuery,
  useGetOrderAnalyticsQuery
} from '../../services/api';
import AdminLayout from './AdminLayout';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import TopProductsTable from '../../components/admin/TopProductsTable';
import './AdminDashboard.css';
import { useSelector } from 'react-redux';
import { getUserData } from '../../utils/tokenHelper';

const AdminDashboard = () => {
  const [period, setPeriod] = useState('monthly');
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery();
  const { data: productAnalytics, isLoading: productLoading } = useGetProductAnalyticsQuery();
  const { data: userAnalytics, isLoading: userLoading } = useGetUserAnalyticsQuery();
  const { data: orderAnalytics, isLoading: orderLoading } = useGetOrderAnalyticsQuery();
  
  // Debug user authentication
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const localStorageUser = getUserData();
  
  useEffect(() => {
    console.log('🏁 AdminDashboard mounted');
    console.log('Authentication state:', {
      reduxUser: user,
      localStorageUser,
      isAuthenticated,
      isAdminInRedux: user && (user.role === 'admin' || user.isAdmin === true),
      isAdminInLocalStorage: localStorageUser && 
        (localStorageUser.role === 'admin' || localStorageUser.isAdmin === true)
    });
  }, [user, isAuthenticated]);
  
  // Modern, elegant color palette
  const THEME_COLORS = {
    primary: '#4361ee',
    secondary: '#3f37c9',
    success: '#4cc9f0',
    warning: '#f72585',
    info: '#4895ef',
    accent1: '#560bad',
    accent2: '#480ca8',
    accent3: '#3a0ca3',
    light: '#f8f9fa',
    dark: '#212529',
    gray: '#6c757d'
  };
  
  // Chart colors - elegant palette
  const COLORS = [THEME_COLORS.primary, THEME_COLORS.warning, THEME_COLORS.success, 
                  THEME_COLORS.info, THEME_COLORS.accent1, THEME_COLORS.accent2];
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Redesigned stat card with elegant styling
  const StatCard = ({ title, value, icon, color, isLoading, suffix = '', description = '', trend = null }) => (
    <Card className="modern-stat-card">
      <Card.Body>
        <div className="stat-card-header">
          <div className="stat-card-icon" style={{ backgroundColor: color }}>
            {icon}
          </div>
          {trend && (
            <div className={`stat-trend ${trend.direction === 'up' ? 'trend-up' : 'trend-down'}`}>
              <span>{trend.value}%</span>
              <i className={`fas fa-arrow-${trend.direction}`}></i>
            </div>
          )}
        </div>
        <div className="stat-card-content">
          <h6 className="stat-card-title">{title}</h6>
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <h3 className="stat-card-value">{value}{suffix}</h3>
          )}
          {description && <p className="stat-card-description">{description}</p>}
        </div>
      </Card.Body>
    </Card>
  );
  
  // Handle period change
  const handlePeriodChange = (key) => {
    setPeriod(key);
  };
  
  if (statsError) {
    return (
      <AdminLayout>
        <Alert variant="danger" className="modern-alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          Error loading dashboard data: {statsError.data?.message || 'An error occurred'}
        </Alert>
      </AdminLayout>
    );
  }
  
  // Get the appropriate analytics data based on period
  const getRevenueData = () => {
    if (!orderAnalytics) return [];
    
    // Return filtered analytics data based on period
    const revenueData = orderAnalytics.revenueByPeriod || [];
    return revenueData.filter(item => {
      if (period === 'weekly') return item.period === 'week';
      if (period === 'monthly') return item.period === 'month';
      if (period === 'yearly') return item.period === 'year';
      return true;
    });
  };
  
  // Get top products data
  const getTopProducts = () => {
    return productAnalytics?.topProducts || [];
  };
  
  // Get recent orders
  const getRecentOrders = () => {
    return orderAnalytics?.recentOrders || [];
  };
  
  // Get customer stats
  const getCustomerStats = () => {
    return userAnalytics?.customersByPeriod || [];
  };
  
  return (
    <AdminLayout>
      <div className="modern-admin-dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div>
            <h2 className="dashboard-title">Dashboard</h2>
            <p className="dashboard-subtitle">Welcome back, {user?.name || 'Admin'}</p>
          </div>
          <div className="dashboard-actions">
            <button className="dashboard-action-btn">
              <FaRegCalendarAlt />
              <span>Today</span>
            </button>
            <button className="dashboard-action-btn notification-btn">
              <FaRegBell />
              <Badge className="notification-badge" bg="danger">3</Badge>
            </button>
            <button className="dashboard-action-btn">
              <FaChartLine />
              <span>Reports</span>
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <Row className="stats-row g-4">
          <Col md={6} xl={3}>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(dashboardStats?.totalRevenue || 0)}
              icon={<FaMoneyBillWave />}
              color={THEME_COLORS.primary}
              isLoading={statsLoading}
              description="All-time revenue"
              trend={{ direction: 'up', value: 12 }}
            />
          </Col>
          <Col md={6} xl={3}>
            <StatCard
              title="Orders"
              value={dashboardStats?.totalOrders || 0}
              icon={<FaShoppingBag />}
              color={THEME_COLORS.warning}
              isLoading={statsLoading}
              description={`${dashboardStats?.pendingOrders || 0} pending`}
              trend={{ direction: 'up', value: 8 }}
            />
          </Col>
          <Col md={6} xl={3}>
            <StatCard
              title="Customers"
              value={dashboardStats?.totalCustomers || 0}
              icon={<FaUsers />}
              color={THEME_COLORS.success}
              isLoading={statsLoading}
              description={`${dashboardStats?.newCustomers || 0} new this month`}
              trend={{ direction: 'up', value: 24 }}
            />
          </Col>
          <Col md={6} xl={3}>
            <StatCard
              title="Products"
              value={dashboardStats?.totalProducts || 0}
              icon={<FaShoppingCart />}
              color={THEME_COLORS.info}
              isLoading={statsLoading}
              description={`${dashboardStats?.lowStockProducts || 0} low in stock`}
              trend={{ direction: 'down', value: 3 }}
            />
          </Col>
        </Row>
        
        {/* Charts */}
        <Row className="g-4 mt-1">
          <Col lg={8}>
            <Card className="modern-chart-card">
              <Card.Header className="chart-card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Revenue Overview</h5>
                  <Tabs
                    activeKey={period}
                    onSelect={handlePeriodChange}
                    className="modern-chart-tabs"
                  >
                    <Tab eventKey="weekly" title="Weekly" />
                    <Tab eventKey="monthly" title="Monthly" />
                    <Tab eventKey="yearly" title="Yearly" />
                  </Tabs>
                </div>
              </Card.Header>
              <Card.Body>
                {orderLoading ? (
                  <div className="chart-loader">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : !orderAnalytics || !orderAnalytics.revenueByPeriod || orderAnalytics.revenueByPeriod.length === 0 ? (
                  <div className="text-center p-4">
                    <Alert variant="warning">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      Revenue data could not be loaded. Using mock data instead.
                    </Alert>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                      data={getRevenueData()}
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={THEME_COLORS.warning} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={THEME_COLORS.warning} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke={THEME_COLORS.gray} />
                      <YAxis stroke={THEME_COLORS.gray} />
                      <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke={THEME_COLORS.primary}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke={THEME_COLORS.warning}
                        fillOpacity={1}
                        fill="url(#colorOrders)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="modern-chart-card h-100">
              <Card.Header className="chart-card-header">
                <h5 className="mb-0">Sales by Category</h5>
              </Card.Header>
              <Card.Body>
                {productLoading ? (
                  <div className="chart-loader">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : !productAnalytics || !productAnalytics.salesByCategory || productAnalytics.salesByCategory.length === 0 ? (
                  <div className="text-center p-4">
                    <Alert variant="warning">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      Category sales data could not be loaded. Using mock data instead.
                    </Alert>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        nameKey="name"
                        data={productAnalytics?.salesByCategory || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {(productAnalytics?.salesByCategory || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Tables */}
        <Row className="g-4 mt-1">
          <Col lg={6}>
            <Card className="modern-table-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Top Selling Products</h5>
                <button className="btn-view-all">Xem thêm</button>
              </Card.Header>
              <Card.Body className="p-0">
                <TopProductsTable 
                  products={getTopProducts()} 
                  loading={productLoading} 
                  error={productAnalytics === undefined && !productLoading ? { message: 'Could not load product analytics' } : null} 
                />
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="modern-table-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Orders</h5>
                <button className="btn-view-all">Xem thêm</button>
              </Card.Header>
              <Card.Body className="p-0">
                <RecentOrdersTable 
                  orders={getRecentOrders()} 
                  loading={orderLoading}
                  error={orderAnalytics === undefined && !orderLoading ? { message: 'Could not load order analytics' } : null}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Customer Growth Chart */}
        <Row className="g-4 mt-1 mb-4">
          <Col>
            <Card className="modern-chart-card">
              <Card.Header className="chart-card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Customer Growth</h5>
                  <div className="chart-legend">
                    <span className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: THEME_COLORS.success }}></span>
                      New Customers
                    </span>
                    <span className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: THEME_COLORS.info }}></span>
                      Active Customers
                    </span>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {userLoading ? (
                  <div className="chart-loader">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : userAnalytics === undefined ? (
                  <div className="text-center p-4">
                    <Alert variant="warning">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      Customer data could not be loaded. Using mock data instead.
                    </Alert>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={getCustomerStats()}
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                      barSize={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke={THEME_COLORS.gray} />
                      <YAxis stroke={THEME_COLORS.gray} />
                      <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Bar 
                        dataKey="newUsers" 
                        name="New Customers"
                        fill={THEME_COLORS.success}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="activeUsers" 
                        name="Active Customers" 
                        fill={THEME_COLORS.info}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 