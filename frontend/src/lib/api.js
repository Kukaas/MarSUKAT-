import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Developer API calls (only for development)
export const devAPI = {
  getAvailableUsers: async () => {
    try {
      const response = await api.get("/dev/available-users");
      return response.data.users;
    } catch (error) {
      console.error("Error fetching available users:", error);
      return [];
    }
  },
  
  switchUser: async (email) => {
    try {
      const response = await api.post("/dev/switch-user", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// System Maintenance API calls
export const systemMaintenanceAPI = {
  getActiveDepartmentLevels: async () => {
    try {
      const response = await api.get("/department-levels/active");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

// OTP API calls
export const otpAPI = {
  requestOTP: async (email) => {
    try {
      const response = await api.post("/otp/request", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyOTPAndChangePassword: async (data) => {
    try {
      const response = await api.post("/otp/verify", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Auth API calls
export const authAPI = {
  signup: async (userData) => {
    try {
      const response = await api.post("/auth/signup", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyEmail: async (userId, uniqueString) => {
    try {
      const response = await api.get(`/auth/verify/${userId}/${uniqueString}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add refresh token endpoint
  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh-token");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user data
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createSuperAdmin: async (adminData) => {
    try {
      const response = await api.post("/superadmin/create", adminData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// User API calls
export const userAPI = {
  // JobOrder management
  getAllJobOrders: async () => {
    try {
      const response = await api.get("/users/job-orders");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getJobOrderById: async (id) => {
    try {
      const response = await api.get(`/users/job-orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createJobOrder: async (jobOrderData) => {
    try {
      const response = await api.post("/users/job-orders", jobOrderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateJobOrder: async (id, jobOrderData) => {
    try {
      const response = await api.put(`/users/job-orders/${id}`, jobOrderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  activateJobOrder: async (jobOrderId) => {
    try {
      const response = await api.put(
        `/users/job-orders/${jobOrderId}/activate`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deactivateJobOrder: async (jobOrderId) => {
    try {
      const response = await api.put(
        `/users/job-orders/${jobOrderId}/deactivate`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteJobOrder: async (jobOrderId) => {
    try {
      const response = await api.delete(`/users/job-orders/${jobOrderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // User profile management
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const response = await api.put(`/users/${userId}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Schedule API calls
export const scheduleAPI = {
  // For JobOrder users - get all schedules
  getAllSchedules: async () => {
    try {
      const response = await api.get('/student-orders/schedules/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // For Students - get their schedule by userId
  getMySchedule: async (userId) => {
    try {
      const response = await api.get(`/student-orders/schedules/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Add this new export for notifications
export const notificationAPI = {
  getNotifications: async () => {
    try {
      const response = await api.get('/users/notifications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/users/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/users/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
