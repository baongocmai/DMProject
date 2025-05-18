import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserData } from '../utils/tokenHelper';

const AdminRoute = ({ children }) => {
  // Get user info directly from localStorage as a backup
  const localStorageUser = getUserData();
  
  // Get user info from Redux store
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Log detailed debugging information
  console.log('==== ADMIN ROUTE ACCESS DEBUG ====');
  console.log('Redux Auth State:', { 
    user: user,
    isAuthenticated: isAuthenticated
  });
  console.log('LocalStorage User:', localStorageUser);
  
  // Try both Redux state and localStorage for admin check
  const isAdminFromRedux = user && (user.role === 'admin' || user.isAdmin === true);
  const isAdminFromLocalStorage = localStorageUser && 
    (localStorageUser.role === 'admin' || localStorageUser.isAdmin === true);
  
  console.log('Admin Status:', {
    isAdminFromRedux, 
    isAdminFromLocalStorage,
    combinedCheck: isAdminFromRedux || isAdminFromLocalStorage
  });
  
  // Use either Redux or localStorage data for access decision
  if (!isAuthenticated || (!isAdminFromRedux && !isAdminFromLocalStorage)) {
    console.log('❌ Admin access denied - Redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✓ Admin access granted');
  return children;
};

export default AdminRoute; 