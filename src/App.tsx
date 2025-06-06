import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';
import Jobs from './pages/dashboard/Jobs.tsx';
import Labor from './pages/dashboard/Labor.tsx';
import Materials from './pages/dashboard/Materials.tsx';
import Employees from './pages/dashboard/Employees.tsx';
import Companies from './pages/dashboard/Companies.tsx';
import Settings from './pages/dashboard/Settings.tsx';
import NotFound from './pages/NotFound.tsx';
import MobileTimeEntry from './pages/mobile/TimeEntry.tsx';
import MobileJobView from './pages/mobile/JobView.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import LoadingScreen from './components/common/LoadingScreen';

function App() {
  const { user, loading } = useAuth();
  console.log('🎯 APP RENDER - loading:', loading, 'user:', !!user, 'userProfile:', !!user);

  useEffect(() => {
    // Set app title
    document.title = 'FieldSync - Field Service Management';
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard\" replace />} />
      <Route path="/register\" element={!user ? <Register /> : <Navigate to="/dashboard\" replace />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/labor" element={<ProtectedRoute><Labor /></ProtectedRoute>} />
      <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
      
      {/* Admin Only Routes */}
      <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
      <Route path="/companies" element={<AdminRoute><Companies /></AdminRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      {/* Mobile Routes */}
      <Route path="/mobile/time-entry" element={<ProtectedRoute><MobileTimeEntry /></ProtectedRoute>} />
      <Route path="/mobile/job/:id" element={<ProtectedRoute><MobileJobView /></ProtectedRoute>} />
      
      {/* Default Routes */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;