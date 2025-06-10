import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login                 from './components/Auth/Login';
import Register              from './components/Auth/Register';
import AdminDashboard        from './components/Dashboard/AdminDashboard';
import SalesManagerDashboard from './components/Dashboard/SalesManagerDashboard';
import Header                from './components/Layout/Header';
import Sidebar               from './components/Layout/Sidebar';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Not logged in?
  if (!isAuthenticated || !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  // Role-based guard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function DashboardRouter() {
  const { user } = useAuth();

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'sales_manager':
      return <SalesManagerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  // PWA service worker (optional)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Register />
          }
        />

        {/* Root → Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardRouter />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' }
        }}
      />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
