import React from 'react';
import { formatError } from '../utils/errorHandler';
import Message from './Message';

/**
 * Component to handle API loading states and errors
 */
const ApiErrorBoundary = ({ 
  isLoading, 
  error, 
  loadingComponent, 
  errorComponent,
  children 
}) => {
  // Show loading component if loading
  if (isLoading) {
    return loadingComponent || <div className="loading-indicator">Loading...</div>;
  }
  
  // Show error component if there's an error
  if (error) {
    // Use custom error component if provided
    if (errorComponent) {
      return errorComponent;
    }
    
    // Otherwise, show default error message
    const errorMessage = formatError(error);
    return (
      <Message variant="error">
        {errorMessage}
      </Message>
    );
  }
  
  // If not loading and no error, render children
  return children;
};

export default ApiErrorBoundary; 