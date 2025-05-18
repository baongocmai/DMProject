import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useCreateProductMutation, useUpdateProductMutation } from '../../services/api';
import './ProductForm.css';

const ProductForm = ({ product, onSuccess, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    countInStock: '',
    brand: '',
    image: '',
    isNew: false,
    isFeatured: false,
    salePrice: '',
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState(false);
  
  // Get API hooks
  const [createProduct, { isLoading: isCreating, isSuccess: isCreateSuccess }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating, isSuccess: isUpdateSuccess }] = useUpdateProductMutation();
  
  // Mock categories since the API endpoint is not available
  const categories = [
    { _id: 'electronics', name: 'Electronics' },
    { _id: 'clothing', name: 'Clothing' },
    { _id: 'books', name: 'Books' },
    { _id: 'home', name: 'Home & Garden' }
  ];
  
  // Set initial form data if editing
  useEffect(() => {
    if (product && mode === 'edit') {
      const productData = { ...product };
      // Convert numeric values to string for form inputs
      productData.price = productData.price?.toString() || '';
      productData.salePrice = productData.salePrice?.toString() || '';
      productData.countInStock = productData.countInStock?.toString() || '';
      
      setFormData(productData);
      setImagePreview(product.image);
    }
  }, [product, mode]);
  
  // Handle success response
  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      resetForm();
      if (onSuccess) onSuccess();
    }
  }, [isCreateSuccess, isUpdateSuccess, onSuccess]);
  
  const resetForm = () => {
    if (mode === 'create') {
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        countInStock: '',
        brand: '',
        image: '',
        isNew: false,
        isFeatured: false,
        salePrice: '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setValidated(false);
    setErrors({});
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (formData.salePrice && (isNaN(formData.salePrice) || Number(formData.salePrice) <= 0)) {
      newErrors.salePrice = 'Sale price must be a positive number';
    }
    
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.countInStock) newErrors.countInStock = 'Count in stock is required';
    else if (isNaN(formData.countInStock) || Number(formData.countInStock) < 0) {
      newErrors.countInStock = 'Count must be a non-negative number';
    }
    
    if (mode === 'create' && !imageFile && !formData.image) {
      newErrors.image = 'Product image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({
        ...formData,
        image: 'pending_upload' // This will be replaced with actual URL after upload
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setValidated(true);
      return;
    }
    
    // Prepare form data
    const productData = new FormData();
    for (const key in formData) {
      if (key !== 'image' || (key === 'image' && !imageFile)) {
        productData.append(key, formData[key]);
      }
    }
    
    // Add image file if there's a new one
    if (imageFile) {
      productData.append('image', imageFile);
    }
    
    try {
      if (mode === 'edit') {
        await updateProduct({ id: product._id, productData }).unwrap();
      } else {
        await createProduct(productData).unwrap();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      setErrors({ submit: error.data?.message || 'Failed to save product' });
    }
  };
  
  return (
    <Card className="product-form-card">
      <Card.Header>
        <h5 className="mb-0">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h5>
      </Card.Header>
      <Card.Body>
        {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Product Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price*</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      isInvalid={!!errors.price}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.price}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sale Price</Form.Label>
                    <Form.Control
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      isInvalid={!!errors.salePrice}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.salePrice}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category*</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      isInvalid={!!errors.category}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Count in Stock*</Form.Label>
                    <Form.Control
                      type="number"
                      name="countInStock"
                      value={formData.countInStock}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      isInvalid={!!errors.countInStock}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.countInStock}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Row>
                  <Col xs={6}>
                    <Form.Check
                      type="checkbox"
                      id="isNewCheck"
                      name="isNew"
                      checked={formData.isNew}
                      onChange={handleChange}
                      label="Mark as New"
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Check
                      type="checkbox"
                      id="isFeaturedCheck"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      label="Featured Product"
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Product Image*</Form.Label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="img-fluid mb-2"
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFormData({
                            ...formData,
                            image: ''
                          });
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="d-none"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="upload-label">
                        <div className="upload-icon">
                          <i className="bi bi-cloud-arrow-up"></i>
                        </div>
                        <span>Click to upload image</span>
                      </label>
                    </div>
                  )}
                  {errors.image && (
                    <div className="text-danger mt-2 small">
                      {errors.image}
                    </div>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => {
                if (onSuccess) onSuccess();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                mode === 'edit' ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProductForm; 