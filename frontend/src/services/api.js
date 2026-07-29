import axios from 'axios';

// Axios Instance Configuration for Spring Boot Backend
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for status-specific friendly error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          error.message = "Session expired or invalid credentials. Please login again.";
        } else if (status === 403) {
          error.message = "Permission denied: Your account has Auditor access. Auditors have read-only permissions and cannot create, schedule, restore, delete, or download backups.";
        } else if (status >= 500) {
          error.message = "An unexpected server error occurred. Please try again later.";
        } else {
          error.message = error.response.data?.message || `HTTP ${status} Error`;
        }
      } else {
        error.message = "Unable to connect to backend service. Please check your connection.";
      }
    }
    return Promise.reject(error);
  }
);

// Centralized API Services
export const authService = {
  /**
   * Log in user using credentials.
   * Spring Boot API: POST /api/auth/login
   */
  login: async (username, password) => {
    try {
      const cleanUsername = username ? username.trim() : '';
      const response = await apiClient.post("/auth/login", {
        username: cleanUsername,
        password,
      });

      const userData = response.data;

      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;

    } catch (error) {
      throw new Error(error.message || "Something went wrong during login.");
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current authenticated user details from local state
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verify if a user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export const backupService = {
  /**
   * Get main metrics and stats for dashboard counters.
   * Spring Boot API equivalent: GET /api/backups/stats
   */
  getDashboardStats: async () => {
    const response = await apiClient.get("/backups");
    const backups = response.data;
    
    const totalBackups = backups.length;
    const successfulCount = backups.filter(b => b.status === "COMPLETED").length;
    const failedCount = backups.filter(b => b.status === "FAILED").length;
    const totalStorage = backups.reduce((sum, b) => sum + (b.fileSize || 0), 0);
    
    const completedBackups = backups.filter(b => b.status === "COMPLETED" && b.backupTime);
    let lastBackupTime = "N/A";
    if (completedBackups.length > 0) {
      const sorted = [...completedBackups].sort((a, b) => new Date(b.backupTime) - new Date(a.backupTime));
      lastBackupTime = new Date(sorted[0].backupTime).toLocaleString();
    }
    
    let storageSize = "0 Bytes";
    if (totalStorage > 0) {
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(totalStorage) / Math.log(k));
      storageSize = parseFloat((totalStorage / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    return {
      totalBackups,
      successfulCount,
      failedCount,
      storageSize,
      lastBackupTime
    };
  },

  /**
   * Fetch recent backup operations logs.
   * Spring Boot API equivalent: GET /api/backups/recent
   */
  getRecentActivities: async () => {
    const response = await apiClient.get("/backups");

    return response.data
        .sort((a, b) => new Date(b.backupTime) - new Date(a.backupTime))
        .slice(0, 5);
  },
  /**
   * Get all backups history list.
   * Spring Boot API equivalent: GET /api/backups
   */
  getBackupHistory: async () => {
    const response = await apiClient.get("/backups");
    return response.data;
  },
  /**
   * Add a new backup schedule configuration.
   * Spring Boot API equivalent: POST /api/backups
   */
  scheduleBackup: async (backupData) => {
    const response = await apiClient.post("/backups", backupData);
    return response.data;
  },

  /**
   * Trigger an instant run of a backup schedule.
   * Spring Boot API equivalent: POST /api/backups/{id}/run
   */
  triggerBackup: async (id) => {
    const response = await apiClient.post(`/backups/${id}/run`);
    return response.data;
  },

  /**
   * Delete a backup schedule configuration.
   * Spring Boot API equivalent: DELETE /api/backups/{id}
   */
  deleteBackup: async (id) => {
    const response = await apiClient.delete(`/backups/${id}`);
    return response.data;
  },
  downloadBackup: async (id) => {
    return apiClient.get(`/backups/download/${id}`, {
      responseType: 'blob'
    });
  },
  restoreBackup: async (id) => {
    return apiClient.post(`/backups/${id}/restore`);
  }
};

export default apiClient;
