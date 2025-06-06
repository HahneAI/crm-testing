import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  console.log('🔍 ProtectedRoute - loading:', loading, 'user:', !!user);

  if (loading) {
    console.log('🔍 ProtectedRoute - Showing LoadingScreen');
    return <LoadingScreen />;
  }

  if (!user) {
    console.log('🔍 ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login\" replace />;
  }

  console.log('🔍 ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;