import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import DonorManagementPage from './pages/DonorManagementPage';
import DonationManagementPage from './pages/DonationManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserHomePage from './pages/UserHomePage';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/user" />;
  
  return children;
};

const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* User Route */}
      <Route path="/user" element={
        <UserRoute>
          <UserHomePage />
        </UserRoute>
      } />

      {/* Admin Routes */}
      <Route path="/" element={
        <AdminRoute>
          <AppLayout />
        </AdminRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="donors" element={<DonorManagementPage />} />
        <Route path="donations" element={<DonationManagementPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
