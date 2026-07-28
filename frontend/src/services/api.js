import axios from 'axios';

// 1. Axios Instance Configuration
// Under normal circumstances, when connecting to the Spring Boot backend, 
// you would uncomment the actual axios calls below instead of the mock logic.
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Spring Boot API prefix
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

// 2. LocalStorage Mock Database Initialization


// Helper to simulate API network response delays

// 3. Centralized API Services
// Components will call these functions directly.
// Later, simply replace the mock return statements with: return apiClient.get(...) or post(...)

export const authService = {
  /**
   * Log in user using credentials.
   * Spring Boot API equivalent: POST /api/auth/login
   */
  login: async (username, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });

      const userData = response.data;

      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;

    } catch (error) {
      console.log(error);

      if (axios.isAxiosError(error)) {
        throw new Error(
            error.response?.data?.message ||
            "Invalid username or password."
        );
      }

      throw new Error("Something went wrong.");
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

    const successCount = backups.filter(
        b => b.status === "COMPLETED"
    ).length;

    const failedCount = backups.filter(
        b => b.status === "FAILED"
    ).length;

    const totalStorage = backups.reduce(
        (sum, b) => sum + (b.fileSize || 0),
        0
    );

    return {
      totalBackups,
      successRate:
          totalBackups === 0
              ? 0
              : Math.round(successCount * 100 / totalBackups),

      failedAlerts: failedCount,

      storageSize:
          (totalStorage / 1024).toFixed(2) + " KB"
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
    await delay(1200); // simulate backing up delay
    const backups = JSON.parse(localStorage.getItem('backups')) || [];
    const updated = backups.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: 'Success',
          size: b.size === '0.00 KB' ? '128.4 MB' : b.size,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
      }
      return b;
    });
    localStorage.setItem('backups', JSON.stringify(updated));
    return true;
  },

  /**
   * Delete a backup schedule configuration.
   * Spring Boot API equivalent: DELETE /api/backups/{id}
   */
  deleteBackup: async (id) => {
    await delay(300);
    const backups = JSON.parse(localStorage.getItem('backups')) || [];
    const filtered = backups.filter(b => b.id !== id);
    localStorage.setItem('backups', JSON.stringify(filtered));
    return true;
  }
};

export default apiClient;
