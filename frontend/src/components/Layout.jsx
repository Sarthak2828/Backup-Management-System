import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Determine the active page title based on the path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/history':
        return 'Backup History';
      case '/schedule':
        return 'Schedule Backup';
      default:
        return 'Backup Management System';
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Sidebar navigation */}
      <Sidebar show={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main workspace container */}
      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        
        {/* Navbar header */}
        <Navbar toggleSidebar={toggleSidebar} title={getPageTitle()} />

        {/* Content Outlet for children pages */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>

      {/* Backdrop overlay for mobile sidebar drawer */}
      {sidebarOpen && (
        <div 
          className="modal-backdrop fade show d-lg-none" 
          style={{ zIndex: 1020 }}
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Layout;
