import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backupService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState(null);

  const navigate = useNavigate();

  // Load stats and activity history
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const fetchedStats = await backupService.getDashboardStats();
      const fetchedActivities = await backupService.getRecentActivities();
      setStats(fetchedStats);
      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error fetching dashboard records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Quick Action: Trigger immediate backup run
  const handleTriggerBackup = async (id) => {
    if (!window.confirm(`Are you sure you want to run this backup immediately?`)) return;
    
    setTriggeringId(id);
    try {
      await backupService.triggerBackup(id);
      alert('Backup run completed successfully!');
      // Reload stats and tables
      await loadDashboardData();
    } catch (error) {
      alert('Failed to trigger backup.');
    } finally {
      setTriggeringId(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading system data...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-4 p-4 bg-white rounded shadow-sm d-flex justify-content-between align-items-center border-start border-primary border-4">
        <div>
          <h2 className="fw-bold mb-1">Welcome back!</h2>
          <p className="text-muted m-0">All automated systems are functioning within normal operational limits.</p>
        </div>
        <button 
          onClick={() => navigate('/schedule')}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i>
          <span>Schedule Backup</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        
        {/* Stat 1 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="text-uppercase text-muted fw-semibold small d-block mb-1">Total Configurations</span>
                <span className="fs-3 fw-bold text-dark">{stats?.totalBackups}</span>
              </div>
              <div className="bg-primary-subtle text-primary p-3 rounded">
                <i className="bi bi-gear-wide-connected fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="text-uppercase text-muted fw-semibold small d-block mb-1">Backup Success Rate</span>
                <span className="fs-3 fw-bold text-success">{stats?.successRate}%</span>
              </div>
              <div className="bg-success-subtle text-success p-3 rounded">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="text-uppercase text-muted fw-semibold small d-block mb-1">Total Storage Used</span>
                <span className="fs-3 fw-bold text-info">{stats?.storageSize}</span>
              </div>
              <div className="bg-info-subtle text-info p-3 rounded">
                <i className="bi bi-hdd-network fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="text-uppercase text-muted fw-semibold small d-block mb-1">Active Failure Alerts</span>
                <span className={`fs-3 fw-bold ${stats?.failedAlerts > 0 ? 'text-danger' : 'text-muted'}`}>
                  {stats?.failedAlerts}
                </span>
              </div>
              <div className={`p-3 rounded ${stats?.failedAlerts > 0 ? 'bg-danger-subtle text-danger' : 'bg-light text-secondary'}`}>
                <i className="bi bi-exclamation-octagon fs-4"></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Details + Actions */}
      <div className="row g-4">
        
        {/* Recent Backups Panel */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
              <h5 className="m-0 fw-bold text-dark">Recent Backup Executions</h5>
              <button onClick={loadDashboardData} className="btn btn-sm btn-outline-secondary" disabled={loading}>
                <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i>
                Refresh
              </button>
            </div>
            
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Job Name</th>
                      <th>Size</th>
                      <th>Finished At</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No backup executions configured yet.
                        </td>
                      </tr>
                    ) : (
                      activities.map((job) => (
                        <tr key={job.id}>
                          <td className="ps-4">
                            <span className="fw-semibold text-dark d-block">{job.backupName}</span>
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '240px' }}>
                              {job.databaseName}
                            </small>
                          </td>
                          <td>{job.fileSize} bytes</td>
                          <td className="text-muted small">{job.backupTime}</td>
                          <td>
                            <span className={`badge px-2.5 py-1.5 rounded-pill ${
                              job.status === 'COMPLETED' ? 'bg-success-subtle text-success border border-success-subtle' :
                              job.status === 'FAILED' ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                              'bg-warning-subtle text-warning border border-warning-subtle'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <button
                              onClick={() => handleTriggerBackup(job.id)}
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              disabled={triggeringId !== null}
                            >
                              {triggeringId === job.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  <span>Running...</span>
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-play-fill"></i>
                                  <span>Run Now</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="m-0 fw-bold text-dark">System Checklist</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                
                <li className="list-group-item d-flex align-items-start gap-3 px-0 py-3">
                  <div className="text-success mt-1">
                    <i className="bi bi-check-circle-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-0.5 text-dark">Storage Connectivity</h6>
                    <p className="text-muted small mb-0">Local arrays and cloud nodes reporting OK.</p>
                  </div>
                </li>

                <li className="list-group-item d-flex align-items-start gap-3 px-0 py-3">
                  <div className="text-success mt-1">
                    <i className="bi bi-check-circle-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-0.5 text-dark">Job Scheduler Running</h6>
                    <p className="text-muted small mb-0">Spring Boot cron daemon checking parameters.</p>
                  </div>
                </li>

                <li className="list-group-item d-flex align-items-start gap-3 px-0 py-3">
                  <div className="text-warning mt-1">
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-0.5 text-dark">SSL Security Warning</h6>
                    <p className="text-muted small mb-0">Verify Spring Security HTTPS headers on staging.</p>
                  </div>
                </li>

              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
