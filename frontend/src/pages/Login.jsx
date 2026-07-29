import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect them to dashboard
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Determine redirection path (defaults to home '/')
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(username, password);
      // Success - Redirect
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="row justify-content-center w-100">
        <div className="col-10 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow-sm p-4 border-0">
            
            {/* Header / Brand */}
            <div className="text-center mb-4">
              <i className="bi bi-shield-fill-check text-primary fs-1"></i>
              <h3 className="mt-2 fw-bold text-dark">Backup Portal</h3>
              <p className="text-muted small">Sign in to manage your system archives</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="usernameInput" className="form-label small fw-semibold">Username</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-person text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0 ps-0"
                    id="usernameInput"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="passwordInput" className="form-label small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-muted"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-light border-start-0 ps-0"
                    id="passwordInput"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Hint Box */}
            <div className="mt-4 p-3 bg-light rounded text-center border">
              <span className="text-muted d-block small mb-1">
                <i className="bi bi-info-circle-fill text-info me-1"></i>
                <strong>Demo Mode Credentials</strong>
              </span>
              <code className="small text-dark">
                Admin: admin / password <br />
                Auditor: auditor / password
              </code>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
