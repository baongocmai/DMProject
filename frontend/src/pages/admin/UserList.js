import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch users from API
    // This is a placeholder - replace with actual API call
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false, createdAt: '2023-05-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', isAdmin: false, createdAt: '2023-06-20' },
        { id: 3, name: 'Admin User', email: 'admin@example.com', isAdmin: true, createdAt: '2023-04-10' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleEdit = (user) => {
    setCurrentUser(user);
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Delete user API call would go here
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Save user API call would go here
    setShowModal(false);
    // Update UI optimistically
    setUsers(users.map(user => 
      user.id === currentUser.id ? currentUser : user
    ));
  };

  const handleAddNew = () => {
    setCurrentUser({ id: null, name: '', email: '', isAdmin: false });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="user-list">
        <div className="user-list-header">
          <h1>Users Management</h1>
          <Button variant="primary" onClick={handleAddNew}>
            <FaUserPlus /> Add New User
          </Button>
        </div>

        {loading ? (
          <div className="text-center my-5">Loading users...</div>
        ) : (
          <Table striped bordered hover responsive className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                  <td>{user.createdAt}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(user)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
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
            <Modal.Title>{currentUser?.id ? 'Edit User' : 'Add New User'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSave}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={currentUser?.name || ''} 
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  value={currentUser?.email || ''} 
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox" 
                  label="Admin Privileges" 
                  checked={currentUser?.isAdmin || false} 
                  onChange={(e) => setCurrentUser({...currentUser, isAdmin: e.target.checked})}
                />
              </Form.Group>
              {!currentUser?.id && (
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                    required={!currentUser?.id}
                  />
                </Form.Group>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default UserList; 