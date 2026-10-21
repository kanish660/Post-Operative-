import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Guards a page by authentication and optional role check.
 * Usage: <ProtectedRoute role="patient"><Component /></ProtectedRoute>
 */
const ProtectedRoute = ({ role: requiredRole, children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Redirect to own dashboard if logged in with a different role
    if (role === 'patient') return <Navigate to="/patient/dashboard" replace />;
    if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
