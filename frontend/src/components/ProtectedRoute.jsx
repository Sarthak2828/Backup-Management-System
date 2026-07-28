import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

/**
 * Route protector component that checks user authentication status.
 * Redirects to `/login` if the user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
