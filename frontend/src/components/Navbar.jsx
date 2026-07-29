import React from 'react';
import { authService } from '../services/api';

const Navbar = ({ toggleSidebar, title }) => {
  const currentUser = authService.getCurrentUser();
  const username = currentUser ? currentUser.username : 'Guest User';
  const role = currentUser ? currentUser.role : 'USER';

  return (
    <nav className="navbar navbar-expand-lg top-navbar px-3 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        {/* Toggle sidebar button for mobile */}
        <button 
          className="btn btn-outline-secondary d-lg-none"
          onClick={toggleSidebar}
          type="button"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        {/* Current Page Title */}
        <h4 className="m-0 fw-semibold text-secondary">{title}</h4>
      </div>
      <div className="d-flex align-items-center gap-3">
        {/* User profile dropdown/display */}
        <div className="d-flex align-items-center gap-2">
          <div className="text-end d-none d-md-block">
            <div className="fw-semibold text-dark fs-6">{username}</div>
            <small className="text-muted text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>{role}</small>
          </div>
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
