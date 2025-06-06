import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading, isAdmin } = useAuth();

  console.log('🔍 AdminRoute - loading:', loading, 'user:', !!user, 'isAdmin:', isAdmin);

  if (loading) {
    console.log('🔍 AdminRoute - Showing LoadingScreen');
    return <LoadingScreen />;
  }

  if (!user) {
    console.log('🔍 AdminRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log('🔍 AdminRoute - User not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('🔍 AdminRoute - Admin user authenticated, rendering children');
  return <>{children}</>;
};

export default AdminRoute;