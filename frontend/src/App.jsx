import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout and route protection components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Page components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BackupHistory from './pages/BackupHistory';
import ScheduleBackup from './pages/ScheduleBackup';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Layout and Sub-pages */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default/Dashboard Index page */}
          <Route index element={<Dashboard />} />
          
          {/* History Page */}
          <Route path="history" element={<BackupHistory />} />
          
          {/* Schedule Page */}
          <Route path="schedule" element={<ScheduleBackup />} />
        </Route>

        {/* Wildcard Fallback redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
