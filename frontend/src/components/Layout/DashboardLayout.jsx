import React, { useState } from 'react';
import { Outlet, useLocation, Navigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const getPageTitle = (pathname) => {
  const routes = {
    '/dashboard': 'Job Board',
    '/dashboard/my-jobs': 'My Jobs',
    '/dashboard/favorites': 'Favorites',
    '/dashboard/profile': 'Profile',
    '/dashboard/admin': 'Admin Panel',
    '/dashboard/chat': 'Messages',
  };
  return routes[pathname] || 'Dashboard';
};

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 transition-transform duration-200 lg:flex lg:flex-col lg:w-64 border-r bg-card`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getPageTitle(location.pathname)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="mt-12 py-6 border-t text-center text-xs text-muted-foreground">
            <div className="flex justify-center gap-4 mb-2">
              <Link to="/terms" target="_blank" className="hover:text-primary hover:underline transition-colors">Terms of Service</Link>
              <Link to="/privacy" target="_blank" className="hover:text-primary hover:underline transition-colors">Privacy Policy</Link>
              <Link to="/safety" target="_blank" className="hover:text-primary hover:underline transition-colors">Safety Tips</Link>
            </div>
            <p>&copy; {new Date().getFullYear()} Campus Gigs. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
