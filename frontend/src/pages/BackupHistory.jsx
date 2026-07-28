import React, { useState, useEffect } from 'react';
import { backupService } from '../services/api';

const BackupHistory = () => {
  const [backups, setBackups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // Load history records
  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await backupService.getBackupHistory();
      setBackups(data);
    } catch (error) {
      console.error('Error fetching backup history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Trigger Immediate Run
  const handleRunBackup = async (id) => {
    if (!window.confirm('Run this backup schedule immediately?')) return;
    
    setActionId(id);
    try {
      await backupService.triggerBackup(id);
      alert('Backup completed successfully!');
      await loadHistory();
    } catch (error) {
      alert('Backup FAILED.');
    } finally {
      setActionId(null);
    }
  };

  // Delete Backup Configuration
  const handleDeleteBackup = async (id) => {
    if (!window.confirm('Are you sure you want to delete this backup schedule? This cannot be undone.')) return;
    
    setActionId(id);
    try {
      await backupService.deleteBackup(id);
      await loadHistory();
    } catch (error) {
      alert('FAILED to delete backup configuration.');
    } finally {
      setActionId(null);
    }
  };

  // Filtering Logic
  const filteredBackups = backups.filter(item => {
    const matchesSearch =
        (item.backupName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.databaseName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id).includes(searchTerm);
      
    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <h5 className="m-0 fw-bold text-dark">Backup Job Configurations & Logs</h5>
      </div>
      
      <div className="card-body">
        {/* Controls Layout */}
        <div className="row g-3 mb-4">
          {/* Search bar */}
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search by job name, source directory, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filter dropdown */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-filter text-muted"></i>
              </span>
              <select
                className="form-select bg-light border-start-0 ps-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Execution Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">FAILED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          {/* Refresh Action */}
          <div className="col-12 col-md-2 text-md-end">
            <button
                className="btn btn-sm btn-outline-secondary"
                title="Feature coming soon"
                disabled
            >
              <i className="bi bi-play-fill"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Fetching records...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle border-top mb-0">
              <thead className="table-light">
                <tr>
                  <th>Job ID</th>
                  <th>Name</th>
                  <th>Configuration Info</th>
                  <th>Frequency / Time</th>
                  <th>Status</th>
                  <th>Last Executed</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBackups.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-folder-x fs-1 d-block mb-2"></i>
                      No backup jobs match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredBackups.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-semibold text-dark small">{item.id}</td>
                      <td>
                        <span className="fw-bold text-dark d-block">{item.backupName}</span>
                      </td>
                      <td>
                        <div className="small">
                          <strong className="text-muted">Database:</strong>
                          <code>{item.databaseName}</code>
                        </div>

                        <div className="small">
                          <strong className="text-muted">File:</strong>
                          {item.filePath}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{item.scheduledFrequency || "Manual"}</div>
                        <div className="text-muted small">{new Date(item.backupTime).toLocaleString()}</div>
                      </td>
                      <td>
                        <span className={`badge px-2.5 py-1.5 rounded-pill ${
                          item.status === 'COMPLETED' ? 'bg-success-subtle text-success border border-success-subtle' :
                          item.status === 'FAILED' ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                          'bg-warning-subtle text-warning border border-warning-subtle'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <span className="text-dark small d-block">{new Date(item.backupTime).toLocaleString()}</span>
                        {item.status === 'COMPLETED' && item.size !== '0.00 KB' && (
                          <small className="text-muted">Size: {item.fileSize} bytes</small>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            onClick={() => handleRunBackup(item.id)}
                            className="btn btn-sm btn-outline-primary"
                            title="Run Immediately"
                            disabled={actionId !== null}
                          >
                            {actionId === item.id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className="bi bi-play-fill"></i>
                            )}
                          </button>

                          <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                              title="Delete not implemented"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupHistory;
