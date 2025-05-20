import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Form, InputGroup, Pagination, 
  Row, Col, Card, Badge, Spinner, Modal, Alert 
} from 'react-bootstrap';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaSort, 
  FaSortUp, FaSortDown, FaImage, FaFilter, FaTimes 
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  useGetProductsQuery, 
  useDeleteProductMutation
} from '../../services/api';
import AdminLayout from './AdminLayout';
import ProductForm from '../../components/admin/ProductForm';
import { formatCurrency } from '../../utils/formatters';
import './ProductList.css';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    search: searchQuery,
    category: '',
    price: { min: '', max: '' },
    stock: { min: '', max: '' },
    status: ''
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState({ field: 'createdAt', direction: 'desc' });
  const [advancedFilterVisible, setAdvancedFilterVisible] = useState(false);
  
  // State for new/edit product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Mock categories for filtering
  const categories = [
    { _id: 'milk', name: 'Sữa các loại' },
    { _id: 'produce', name: 'Rau - Củ - Trái Cây' },
    { _id: 'cleaning', name: 'Hóa Phẩm - Tẩy rửa' },
    { _id: 'personal-care', name: 'Chăm Sóc Cá Nhân' },
    { _id: 'office-toys', name: 'Văn phòng phẩm - Đồ chơi' },
    { _id: 'candy', name: 'Bánh Kẹo' },
    { _id: 'beverages', name: 'Đồ uống - Giải khát' },
    { _id: 'instant-food', name: 'Mì - Thực Phẩm Ăn Liền' }
  ];
  
  // Query products with filters
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
    error: productsError
  } = useGetProductsQuery({
    page,
    limit,
    sort: `${sort.field}:${sort.direction}`,
    keyword: filters.search,
    category: filters.category,
    min: filters.price.min,
    max: filters.price.max,
    inStock: filters.stock.min > 0 ? true : undefined
  });
  
  // Delete product mutation
  const [deleteProduct, { isLoading: isDeleting, error: deleteError }] = useDeleteProductMutation();
  
  const products = productsData?.products || [];
  const totalProducts = productsData?.totalCount || 0;
  const totalPages = Math.ceil(totalProducts / limit);
  
  // Update filters when URL query parameters change
  useEffect(() => {
    const search = queryParams.get('search') || '';
    
    if (search !== filters.search) {
      setFilters(prev => ({
        ...prev,
        search: search
      }));
      setPage(1); // Reset to first page when search changes
    }
  }, [location.search]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };
  
  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    
    // Update URL with search parameter
    const params = new URLSearchParams();
    if (filters.search) {
      params.set('search', filters.search);
    }
    navigate({ search: params.toString() });
    
    refetchProducts();
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested filters (price.min, stock.max, etc)
      const [parent, child] = name.split('.');
      setFilters({
        ...filters,
        [parent]: {
          ...filters[parent],
          [child]: value
        }
      });
    } else {
      // Handle normal filters
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };
  
  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when filtering
    
    // Update URL with search parameter
    const params = new URLSearchParams();
    if (filters.search) {
      params.set('search', filters.search);
    }
    navigate({ search: params.toString() });
    
    refetchProducts();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      price: { min: '', max: '' },
      stock: { min: '', max: '' },
      status: ''
    });
    setPage(1);
    
    // Clear URL parameters
    navigate({ search: '' });
    
    refetchProducts();
  };
  
  // Handle sort change
  const handleSort = (field) => {
    console.log('Sorting by:', field);
    let direction = 'asc';
    
    if (sort.field === field) {
      direction = sort.direction === 'asc' ? 'desc' : sort.direction === 'desc' ? '' : 'asc';
    }
    
    setSort({
      field,
      direction
    });
    
    // Delay refetch để đảm bảo state đã được cập nhật
    setTimeout(() => {
      refetchProducts();
    }, 100);
  };
  
  // Get sort icon for table headers
  const getSortIcon = (field) => {
    if (sort.field !== field) return <FaSort className="sort-icon" />;
    if (sort.direction === 'asc') return <FaSortUp className="sort-icon active" />;
    if (sort.direction === 'desc') return <FaSortDown className="sort-icon active" />;
    return <FaSort className="sort-icon" />;
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  // Format page button
  const renderPageButton = (pageNum) => (
    <Pagination.Item
      key={pageNum}
      active={pageNum === page}
      onClick={() => handlePageChange(pageNum)}
    >
      {pageNum}
    </Pagination.Item>
  );
  
  // Generate pagination items
  const renderPagination = () => {
    const pages = [];
    
    // Add first page
    pages.push(renderPageButton(1));
    
    // Add ellipsis if needed
    if (page > 3) {
      pages.push(<Pagination.Ellipsis key="ellipsis-1" disabled />);
    }
    
    // Add pages around current page
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(renderPageButton(i));
      }
    }
    
    // Add ellipsis if needed
    if (page < totalPages - 2) {
      pages.push(<Pagination.Ellipsis key="ellipsis-2" disabled />);
    }
    
    // Add last page if there are multiple pages
    if (totalPages > 1) {
      pages.push(renderPageButton(totalPages));
    }
    
    return pages;
  };
  
  // Handle edit product
  const handleEditProduct = (product) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setShowProductForm(true);
  };
  
  // Handle new product
  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    setShowProductForm(false);
    refetchProducts();
  };
  
  // Confirm delete
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };
  
  // Perform delete
  const performDelete = async () => {
    try {
      await deleteProduct(productToDelete._id).unwrap();
      setShowDeleteModal(false);
      refetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };
  
  // Render product image
  const renderProductImage = (product) => {
    return (
      <div className="product-image-cell">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-thumbnail"
            onError={(e) => {
              e.target.src = 'https://placehold.co/100x100?text=No+Image';
            }}
          />
        ) : (
          <div className="no-image">
            <FaImage />
          </div>
        )}
      </div>
    );
  };
  
  // Render stock badge
  const renderStockBadge = (product) => {
    // Ưu tiên sử dụng trường stock, sau đó mới dùng countInStock
    const stockValue = product.stock !== undefined ? product.stock : (product.countInStock || 0);
    
    if (stockValue === 0 || stockValue === null || stockValue === undefined) {
      return <Badge bg="danger">Out of Stock</Badge>;
    }
    
    if (stockValue < 10) {
      return <Badge bg="warning" text="dark">Low Stock: {stockValue}</Badge>;
    }
    
    return <Badge bg="success">In Stock: {stockValue}</Badge>;
  };
  
  return (
    <AdminLayout>
      <div className="product-list-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="page-title">Products</h3>
          <Button variant="primary" onClick={handleNewProduct}>
            <FaPlus className="me-2" /> Add Product
            </Button>
          </div>
          
        <Card className="mb-4">
          <Card.Body>
            {/* Search and filters */}
            <Row className="mb-3">
              <Col md={6} lg={8}>
            <Form onSubmit={handleSearchSubmit}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={handleSearchChange}
                    />
                    <Button type="submit" variant="outline-primary">
                      <FaSearch />
                    </Button>
                    <Button 
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setAdvancedFilterVisible(!advancedFilterVisible)}
                    >
                      <FaFilter /> {advancedFilterVisible ? 'Hide Filters' : 'Filters'}
                    </Button>
                  </InputGroup>
                </Form>
              </Col>
              
              <Col md={6} lg={4}>
                <div className="d-flex justify-content-md-end mt-3 mt-md-0">
                  <Form.Select 
                    className="me-2" 
                    style={{ maxWidth: '100px' }}
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Form.Select>
                  
                  <span className="d-flex align-items-center">
                    per page
                  </span>
                </div>
                </Col>
            </Row>
            
            {/* Advanced filters */}
            {advancedFilterVisible && (
              <div className="advanced-filters p-3 mb-3 bg-light rounded">
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Categories</option>
                        {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                  
                  <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Price Range</Form.Label>
                          <Row>
                            <Col>
                              <Form.Control
                                type="number"
                                placeholder="Min"
                                name="price.min"
                                value={filters.price.min}
                                onChange={handleFilterChange}
                            min="0"
                              />
                            </Col>
                            <Col>
                              <Form.Control
                                type="number"
                                placeholder="Max"
                                name="price.max"
                                value={filters.price.max}
                                onChange={handleFilterChange}
                            min="0"
                              />
                            </Col>
                          </Row>
                        </Form.Group>
                      </Col>
                  
                  <Col md={3}>
                        <Form.Group className="mb-3">
                      <Form.Label>Stock Status</Form.Label>
                      <Form.Select
                                name="stock.min"
                                value={filters.stock.min}
                            onChange={handleFilterChange}
                          >
                        <option value="">All</option>
                        <option value="1">In Stock</option>
                        <option value="0">Out of Stock</option>
                        <option value="10">10+ in Stock</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                  
                  <Col md={2} className="d-flex align-items-end">
                    <div className="mb-3 w-100">
                      <div className="d-grid gap-2">
                        <Button variant="primary" onClick={applyFilters}>
                            Apply Filters
                          </Button>
                          <Button variant="outline-secondary" onClick={resetFilters}>
                          <FaTimes className="me-1" />
                            Reset
                          </Button>
                      </div>
                        </div>
                      </Col>
                    </Row>
        </div>
            )}
            
            {/* Products table */}
            {productsError ? (
              <Alert variant="danger">
                Error loading products: {JSON.stringify(productsError)}
          </Alert>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="product-table">
                <thead>
                  <tr>
                        <th width="60"></th>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('name')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center">
                            Product {getSortIcon('name')}
                          </div>
                        </th>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('price')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center">
                            Price {getSortIcon('price')}
                          </div>
                        </th>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('category')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center">
                            Category {getSortIcon('category')}
                          </div>
                        </th>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('stock')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center">
                            Stock {getSortIcon('stock')}
                          </div>
                        </th>
                        <th 
                          className="sortable" 
                          onClick={() => handleSort('createdAt')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center">
                            Created {getSortIcon('createdAt')}
                          </div>
                        </th>
                        <th width="120">Actions</th>
                  </tr>
                </thead>
                <tbody>
                      {productsLoading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <Spinner animation="border" />
                          </td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No products found
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                    <tr key={product._id}>
                            <td>{renderProductImage(product)}</td>
                      <td>
                            <div className="product-name">{product.name}</div>
                              <div className="product-brand text-muted small">
                                {product.brand}
                        </div>
                      </td>
                      <td>
                        {product.salePrice ? (
                                <>
                                  <div className="sale-price">
                                    {formatCurrency(product.salePrice)}
                                  </div>
                                  <div className="original-price text-muted small text-decoration-line-through">
                                    {formatCurrency(product.price)}
                          </div>
                                </>
                        ) : (
                                formatCurrency(product.price)
                        )}
                      </td>
                      <td>
                              {product.category}
                            </td>
                            <td>
                          {renderStockBadge(product)}
                      </td>
                      <td>
                              {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                              <div className="d-flex">
                                <Button 
                                  size="sm"
                                  variant="outline-primary" 
                                  className="me-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProduct(product);
                                  }}
                                >
                                  <FaEdit />
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline-danger" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(product);
                                  }}
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                      </td>
                    </tr>
                        ))
                      )}
                </tbody>
              </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalProducts)} of {totalProducts} products
                    </div>
                    <Pagination>
                      <Pagination.Prev
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      />
                      {renderPagination()}
                      <Pagination.Next
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </div>
      
      {/* Product form modal */}
      <Modal
        show={showProductForm}
        onHide={() => setShowProductForm(false)}
        size="lg"
        aria-labelledby="product-form-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="product-form-modal">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductForm
            mode={editingProduct ? 'edit' : 'create'}
            product={editingProduct}
            onSuccess={handleFormSuccess}
          />
        </Modal.Body>
      </Modal>
      
      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={performDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default ProductList;