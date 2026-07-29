import React, { useState, useEffect } from 'react';
import { authService, backupService } from '../services/api';

const BackupHistory = () => {
  const [backups, setBackups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [sortBy, setSortBy] = useState('backupTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, frequencyFilter, sortBy, sortOrder]);

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
    
    setActionId('run_' + id);
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
    if (!window.confirm('Are you sure you want to permanently delete this backup?')) return;
    
    setActionId('delete_' + id);
    try {
      await backupService.deleteBackup(id);
      alert('Backup deleted successfully!');
      await loadHistory();
    } catch (error) {
      alert('FAILED to delete backup.');
    } finally {
      setActionId(null);
    }
  };
  
  // Download Backup File
  const handleDownloadBackup = async (id, backupName) => {
    setActionId('download_' + id);
    try {
      const response = await backupService.downloadBackup(id);
      
      const fileName = backupName || `backup_${id}.zip.enc`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Download started successfully!');
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('FAILED to download backup. The file might not exist on the server.');
    } finally {
      setActionId(null);
    }
  };

  // Restore Backup Database
  const handleRestoreBackup = async (id) => {
    if (!window.confirm('Restoring this backup will overwrite the selected database. Continue?')) return;
    
    setActionId('restore_' + id);
    try {
      await backupService.restoreBackup(id);
      alert('Database restored successfully!');
      await loadHistory();
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('FAILED to restore database. Please check server logs.');
    } finally {
      setActionId(null);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filtering, Sorting and Pagination Logic
  const processedBackups = backups
    .filter(item => {
      const matchesSearch =
        (item.backupName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.databaseName || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === '' || item.status === statusFilter;
      const matchesFrequency = frequencyFilter === '' || item.scheduledFrequency === frequencyFilter;
      
      return matchesSearch && matchesStatus && matchesFrequency;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'backupName') {
        comparison = (a.backupName || '').localeCompare(b.backupName || '');
      } else if (sortBy === 'fileSize') {
        comparison = (a.fileSize || 0) - (b.fileSize || 0);
      } else if (sortBy === 'backupTime') {
        const dateA = a.backupTime ? new Date(a.backupTime) : new Date(0);
        const dateB = b.backupTime ? new Date(b.backupTime) : new Date(0);
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedBackups = processedBackups.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <h5 className="m-0 fw-bold text-dark">Backup Job Configurations & Logs</h5>
      </div>
      
      <div className="card-body">
        {/* Controls Layout */}
        <div className="row g-3 mb-4">
          {/* Search bar */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search by job or DB name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filter Status */}
          <div className="col-12 col-sm-6 col-md-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-filter text-muted"></i>
              </span>
              <select
                className="form-select bg-light border-start-0 ps-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">FAILED</option>
                <option value="PENDING">PENDING</option>
                <option value="SCHEDULED">SCHEDULED</option>
              </select>
            </div>
          </div>

          {/* Filter Frequency */}
          <div className="col-12 col-sm-6 col-md-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-calendar3 text-muted"></i>
              </span>
              <select
                className="form-select bg-light border-start-0 ps-0"
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
              >
                <option value="">All Frequencies</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </div>

          {/* Sort By Field */}
          <div className="col-12 col-sm-6 col-md-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-sort-down text-muted"></i>
              </span>
              <select
                className="form-select bg-light border-start-0 ps-0"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="backupTime">Sort by Time</option>
                <option value="fileSize">Sort by Size</option>
                <option value="backupName">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Sort Direction Toggle */}
          <div className="col-12 col-sm-6 col-md-2">
            <button
              type="button"
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              <i className={`bi bi-sort-numeric-${sortOrder === 'asc' ? 'down' : 'up'}`}></i>
              <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
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
          <>
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
                {processedBackups.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-folder-x fs-1 d-block mb-2"></i>
                      No backup jobs match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedBackups.map((item) => (
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

                        <div className="small text-truncate" style={{ maxWidth: '250px' }} title={item.filePath}>
                          <strong className="text-muted">File:</strong> {item.filePath}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{item.scheduledFrequency || "Manual"}</div>
                        <div className="text-muted small">
                          {item.backupTime ? new Date(item.backupTime).toLocaleString() : 'N/A'}
                        </div>
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
                        <span className="text-dark small d-block">
                          {item.backupTime ? new Date(item.backupTime).toLocaleString() : 'N/A'}
                        </span>
                        {item.status === 'COMPLETED' && (
                          <small className="text-muted">Size: {formatBytes(item.fileSize)}</small>
                        )}
                      </td>
                      <td className="text-end">
                        {authService.getCurrentUser()?.role === 'ADMIN' ? (
                          <div className="d-inline-flex gap-2">
                            <button
                              onClick={() => handleRunBackup(item.id)}
                              className="btn btn-sm btn-outline-primary"
                              title="Run Immediately"
                              disabled={actionId !== null}
                            >
                              {actionId === 'run_' + item.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-play-fill"></i>
                              )}
                            </button>

                            <button
                              onClick={() => handleDownloadBackup(item.id, item.backupName)}
                              className="btn btn-sm btn-outline-success"
                              title="Download Backup"
                              disabled={actionId !== null || item.status !== 'COMPLETED'}
                            >
                              {actionId === 'download_' + item.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-download"></i>
                              )}
                            </button>

                            <button
                              onClick={() => handleRestoreBackup(item.id)}
                              className="btn btn-sm btn-outline-warning"
                              title="Restore Backup"
                              disabled={actionId !== null || item.status !== 'COMPLETED'}
                            >
                              {actionId === 'restore_' + item.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-arrow-counterclockwise"></i>
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteBackup(item.id)}
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Backup"
                              disabled={actionId !== null}
                            >
                              {actionId === 'delete_' + item.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-trash"></i>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary border">Read-Only</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {processedBackups.length > 10 && (
            <div className="d-flex align-items-center justify-content-between border-top px-4 py-3 bg-white">
              <div className="text-secondary small">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, processedBackups.length)} of {processedBackups.length} backups
              </div>
              <nav aria-label="Backup history page navigation">
                <ul className="pagination pagination-sm m-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: Math.ceil(processedBackups.length / 10) }, (_, i) => i + 1).map(pageNum => (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === Math.ceil(processedBackups.length / 10) ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(processedBackups.length / 10)))}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default BackupHistory;
