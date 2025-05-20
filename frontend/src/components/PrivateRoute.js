import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If role not permitted, deny access
    return <div><h3>Access Denied</h3><p>You do not have permission to view this page.</p></div>;
  }
  // Authorized, render the child component(s)
  return children;
};

export default PrivateRoute;
