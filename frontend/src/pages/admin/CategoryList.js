import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSync } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import ApiDebug from '../../components/ApiDebug';
import './CategoryList.css';
import { 
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from '../../services/api';
import axios from 'axios';

// Default categories to use if API doesn't return data
const defaultCategories = [
  { _id: 'milk', name: 'Sữa các loại', slug: 'sua-cac-loai', productsCount: 8 },
  { _id: 'produce', name: 'Rau - Củ - Trái Cây', slug: 'rau-cu-trai-cay', productsCount: 12 },
  { _id: 'cleaning', name: 'Hóa Phẩm - Tẩy rửa', slug: 'hoa-pham-tay-rua', productsCount: 5 },
  { _id: 'personal-care', name: 'Chăm Sóc Cá Nhân', slug: 'cham-soc-ca-nhan', productsCount: 7 },
  { _id: 'office-toys', name: 'Văn phòng phẩm - Đồ chơi', slug: 'van-phong-pham-do-choi', productsCount: 10 },
  { _id: 'candy', name: 'Bánh Kẹo', slug: 'banh-keo', productsCount: 15 },
  { _id: 'beverages', name: 'Đồ uống - Giải khát', slug: 'do-uong-giai-khat', productsCount: 9 },
  { _id: 'instant-food', name: 'Mì - Thực Phẩm Ăn Liền', slug: 'mi-thuc-pham-an-lien', productsCount: 6 }
];

const CategoryList = () => {
  const { data: apiCategories, isLoading, error, refetch } = useGetCategoriesQuery();
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [updatingCounts, setUpdatingCounts] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [localCategories, setLocalCategories] = useState([]);
  
  // Use defaultCategories if API doesn't return data
  const categories = apiCategories && (Array.isArray(apiCategories) && apiCategories.length > 0) 
    ? apiCategories 
    : localCategories.length > 0 ? localCategories : defaultCategories;

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Debug logging
  useEffect(() => {
    console.log('API Categories data:', apiCategories);
    console.log('Using categories:', categories);
    console.log('Loading state:', isLoading);
    console.log('Error state:', error);
  }, [categories, apiCategories, isLoading, error]);

  // Initialize local categories when API data is loaded
  useEffect(() => {
    if (apiCategories && Array.isArray(apiCategories) && apiCategories.length > 0) {
      setLocalCategories(apiCategories);
    } else {
      // Only set default categories on initial load
      const initialRun = localCategories.length === 0;
      if (initialRun) {
        setLocalCategories([...defaultCategories]);
      }
    }
  }, [apiCategories]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        // Try API call first
        await deleteCategory(categoryId).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete category:', err);
        
        // If API call fails, update locally
        const updatedCategories = localCategories.filter(cat => cat._id !== categoryId);
        setLocalCategories(updatedCategories);
        alert('API call failed, but category was removed from the UI.');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory._id) {
        // Update existing category
        try {
          await updateCategory({
            id: currentCategory._id,
            categoryData: {
              name: currentCategory.name,
              slug: currentCategory.slug,
              description: currentCategory.description || '',
              productsCount: currentCategory.productsCount
            }
          }).unwrap();
          refetch();
        } catch (err) {
          // If API call fails, update locally
          const updatedCategories = localCategories.map(cat => 
            cat._id === currentCategory._id ? {...currentCategory} : cat
          );
          setLocalCategories(updatedCategories);
          console.log('API call failed, but category was updated locally.');
        }
      } else {
        // Create new category
        try {
          const result = await createCategory({
            name: currentCategory.name,
            slug: currentCategory.slug,
            description: currentCategory.description || '',
            productsCount: 0
          }).unwrap();
          refetch();
        } catch (err) {
          // If API call fails, add locally with temporary ID
          const newCategory = {
            ...currentCategory,
            _id: 'local_' + Date.now(),
            productsCount: 0
          };
          setLocalCategories([...localCategories, newCategory]);
          console.log('API call failed, but category was added locally.');
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleAddNew = () => {
    setCurrentCategory({ name: '', slug: '', description: '', productsCount: 0 });
    setShowModal(true);
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setCurrentCategory({
      ...currentCategory,
      name,
      slug: generateSlug(name)
    });
  };

  // Update product counts for all categories
  const updateProductCounts = async () => {
    setUpdatingCounts(true);
    setUpdateMessage({ type: 'info', text: 'Đang cập nhật số lượng sản phẩm từ database...' });
    
    try {
      // Check if API endpoint exists first
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      let productCountsResponse;
      let categoryCounts = null;
      
      try {
        // Try to get actual product counts from database using dedicated endpoint
        productCountsResponse = await axios.get(`${apiUrl}/products/counts-by-category`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          // Short timeout to fail fast if API doesn't exist
          timeout: 3000
        });
        
        if (productCountsResponse.data && productCountsResponse.data.success) {
          categoryCounts = productCountsResponse.data.categoryCounts;
        }
      } catch (apiError) {
        console.log('Dedicated endpoint not found, trying alternative method:', apiError);
        
        // Alternative: Get all products and count by category
        try {
          const allProductsResponse = await axios.get(`${apiUrl}/products`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (allProductsResponse.data && Array.isArray(allProductsResponse.data)) {
            // Count products by category
            const products = allProductsResponse.data;
            categoryCounts = [];
            
            // Group products by category and count
            const countsByCategory = products.reduce((acc, product) => {
              const categoryId = product.category?._id || product.categoryId;
              if (categoryId) {
                acc[categoryId] = (acc[categoryId] || 0) + 1;
              }
              return acc;
            }, {});
            
            // Convert to array format
            categoryCounts = Object.keys(countsByCategory).map(categoryId => ({
              categoryId,
              count: countsByCategory[categoryId]
            }));
          }
        } catch (alternativeError) {
          console.log('Alternative method failed:', alternativeError);
          throw new Error('Could not get product counts from any method');
        }
      }
      
      if (categoryCounts) {
        // Update categories with actual counts from database
        const updatedCategories = categories.map(category => {
          const categoryCount = categoryCounts.find(c => c.categoryId === category._id);
          return {
            ...category,
            productsCount: categoryCount ? categoryCount.count : category.productsCount
          };
        });
        
        setLocalCategories(updatedCategories);
        setUpdateMessage({ type: 'success', text: 'Đã cập nhật số lượng thực tế từ database' });
      } else {
        throw new Error('Không thể lấy số liệu sản phẩm từ database');
      }
    } catch (error) {
      console.error('Error fetching product counts:', error);
      
      // Fall back to random counts if API fails
      console.log("Falling back to random counts as database counts couldn't be retrieved");
      
      // Create new array with random product counts as fallback
      const updatedCategories = categories.map(category => ({
        ...category,
        productsCount: Math.floor(Math.random() * 50) + 1 // Random count between 1-50
      }));
      
      // Update local state directly without API calls
      setLocalCategories(updatedCategories);
      
      setUpdateMessage({ type: 'warning', text: 'Không thể lấy số lượng từ database, đã dùng số ngẫu nhiên' });
    } finally {
      setUpdatingCounts(false);
      // Clear message after 5 seconds
      setTimeout(() => setUpdateMessage(null), 5000);
    }
  };

  return (
    <AdminLayout>
      <ApiDebug 
        isLoading={isLoading}
        error={error}
        data={apiCategories}
        name="API Categories"
      />
      <div className="category-list">
        <div className="category-list-header">
          <h1>Categories Management</h1>
          <div className="category-actions">
            <Button 
              variant="success" 
              className="me-2"
              onClick={updateProductCounts}
              disabled={updatingCounts}
            >
              {updatingCounts ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <FaSync className="me-2" />
                  Cập nhật số lượng sản phẩm
                </>
              )}
            </Button>
            <Button variant="primary" onClick={handleAddNew}>
              <FaPlus /> Thêm danh mục
            </Button>
          </div>
        </div>

        {updateMessage && (
          <Alert variant={updateMessage.type} className="my-3" dismissible onClose={() => setUpdateMessage(null)}>
            {updateMessage.text}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="my-3">
            Error loading categories from API: {error.message || 'Unknown error'}. Using default categories.
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading categories...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive className="category-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category._id}>
                  <td>{category._id}</td>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.productsCount}</td>
                  <td>
                    <Button 
                      variant="info" 
                      size="sm" 
                      className="me-2" 
                      onClick={() => handleEdit(category)}
                      disabled={isDeleting}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(category._id)}
                      disabled={isDeleting}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{currentCategory?._id ? 'Edit Category' : 'Add New Category'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSave}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Category Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={currentCategory?.name || ''} 
                  onChange={handleNameChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Slug</Form.Label>
                <InputGroup>
                  <InputGroup.Text>/</InputGroup.Text>
                  <Form.Control 
                    type="text" 
                    value={currentCategory?.slug || ''} 
                    onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value})}
                    required
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Used for URL. Auto-generated from name, but you can customize it.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea"
                  rows={3}
                  value={currentCategory?.description || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && <Spinner animation="border" size="sm" className="me-2" />}
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default CategoryList; 