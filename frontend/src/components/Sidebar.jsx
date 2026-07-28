import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Sidebar = ({ show, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      authService.logout();
      navigate('/login');
    }
  };

  return (
    <aside className={`sidebar ${show ? 'show' : ''}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-bottom border-secondary d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-shield-fill-check text-primary fs-3"></i>
          <span className="fs-5 fw-bold text-white tracking-wide">BackupMS</span>
        </div>
        {/* Mobile close button */}
        <button 
          className="btn btn-link text-white d-lg-none p-0" 
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <i className="bi bi-x-lg fs-4"></i>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-grow-1 py-4">
        <nav className="nav flex-column">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={toggleSidebar}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/history" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={toggleSidebar}
          >
            <i className="bi bi-clock-history"></i>
            <span>Backup History</span>
          </NavLink>

          <NavLink 
            to="/schedule" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={toggleSidebar}
          >
            <i className="bi bi-calendar-plus"></i>
            <span>Schedule Backup</span>
          </NavLink>
        </nav>
      </div>

      {/* Sidebar Footer (Logout) */}
      <div className="p-3 border-top border-secondary">
        <button 
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
