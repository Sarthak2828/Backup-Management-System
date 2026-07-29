import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, backupService } from '../services/api';

const ScheduleBackup = () => {
  const [formData, setFormData] = useState({
    backupName: '',
    databaseName: '',
    scheduledFrequency: 'DAILY'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="card border-0 shadow-sm p-4 text-center my-4">
        <i className="bi bi-shield-lock-fill text-warning display-4 mb-3"></i>
        <h4>Access Restricted</h4>
        <p className="text-muted">You are logged in with Auditor (Read-Only) permissions. Only Administrators can create or modify backup schedules.</p>
        <div>
          <button className="btn btn-primary px-4" onClick={() => navigate('/')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.backupName.trim() || !formData.databaseName.trim()) {
      setError("Please provide a backup name and database name.");
      return;
    }

    setLoading(true);
    try {
      await backupService.scheduleBackup(formData);
      setSuccess(true);
      // Reset form variables
      setFormData({
        backupName: '',
        databaseName: '',
        scheduledFrequency: 'DAILY'
      });
      // Redirect to history after 1.5 seconds
      setTimeout(() => {
        navigate('/history');
      }, 1500);
    } catch (err) {
      setError('Failed to save the backup configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm">
          
          <div className="card-header bg-white py-3">
            <h5 className="m-0 fw-bold text-dark">Schedule New Backup Configuration</h5>
          </div>

          <div className="card-body p-4">
            
            {/* Feedback Alerts */}
            {success && (
              <div className="alert alert-success py-2.5 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
                <i className="bi bi-check-circle-fill fs-5"></i>
                <div>Configuration saved successfully! Redirecting to backup history logs...</div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2.5 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Job Name */}
              <div className="mb-3">
                <label htmlFor="backupName" className="form-label fw-semibold text-secondary small">
                  Backup Job Name
                </label>

                <input
                    type="text"
                    className="form-control bg-light"
                    id="backupName"
                    name="backupName"
                    placeholder="e.g. Daily MySQL Backup"
                    value={formData.backupName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
              </div>

              <div className="row g-3 mb-3">
                {/* Source Directory */}
                <div className="col-12 col-md-6">
                  <label htmlFor="databaseName" className="form-label fw-semibold text-secondary small">
                    Database Name
                  </label>

                  <input
                      type="text"
                      className="form-control bg-light"
                      id="databaseName"
                      name="databaseName"
                      placeholder="e.g. backup_management_system"
                      value={formData.databaseName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                {/* Frequency */}
                <div className="col-12 col-md-6">
                  <label htmlFor="frequency" className="form-label fw-semibold text-secondary small">Execution Frequency</label>
                  <select
                    className="form-select bg-light"
                    id="frequency"
                    name="scheduledFrequency"
                    value={formData.scheduledFrequency}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Saving Config...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-check-fill"></i>
                      <span>Save Schedule</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleBackup;
