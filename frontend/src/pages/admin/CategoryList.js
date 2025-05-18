import React, { useState } from 'react';
import { Table, Button, Modal, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import './CategoryList.css';
import { 
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from '../../services/api';

const CategoryList = () => {
  const { data: categories, isLoading, error, refetch } = useGetCategoriesQuery();
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete category:', err);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory._id) {
        // Update existing category
        await updateCategory({
          id: currentCategory._id,
          categoryData: {
            name: currentCategory.name,
            slug: currentCategory.slug,
            description: currentCategory.description || ''
          }
        }).unwrap();
      } else {
        // Create new category
        await createCategory({
          name: currentCategory.name,
          slug: currentCategory.slug,
          description: currentCategory.description || ''
        }).unwrap();
      }
      setShowModal(false);
      refetch();
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

  return (
    <AdminLayout>
      <div className="category-list">
        <div className="category-list-header">
          <h1>Categories Management</h1>
          <Button variant="primary" onClick={handleAddNew}>
            <FaPlus /> Add New Category
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="my-3">
            Error loading categories: {error.message || 'Unknown error'}
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
              {categories?.map(category => (
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