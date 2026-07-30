import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/** Redirects non-admin users to /cars with a toast notification */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    toast.error('Admin access required');
    return <Navigate to="/cars" replace />;
  }

  return children;
};

export default AdminRoute;
