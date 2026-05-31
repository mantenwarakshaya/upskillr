import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for the auth check to finish before redirecting
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a spinner component
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the protected component
  return children;
};