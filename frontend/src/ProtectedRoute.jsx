import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './components/AuthProvider';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for the backend /api/auth/me verification to complete
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading Upskillr...</div>
      </div>
    );
  }

  // If cookie/token is invalid or missing, kick them back to the landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If children exist, render them, otherwise render the nested Outlet routes
  return children ? children : <Outlet />;
};