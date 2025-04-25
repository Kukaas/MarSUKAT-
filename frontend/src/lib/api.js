import axios from "axios";
import Cookies from "js-cookie";

// Determine which API URL to use based on the current hostname
const getApiUrl = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalhost ?
    import.meta.env.VITE_API_URL :
    import.meta.env.VITE_API_URL_NETWORK;
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
  // Add default timeout
  timeout: 30000, // 30 seconds
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    // No need to manually set Authorization header when using httpOnly cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any existing cookies on 401
      Cookies.remove('access_token', { path: '/' });
    }
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
      console.error(error)
      throw error;
    }
  },

  deleteUser: async (email) => {
    try {
      const response = await api.delete("/dev/delete-user", { data: { email } });
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  createTestOrder: async (studentEmail) => {
    try {
      const response = await api.post("/dev/create-test-order", { studentEmail });
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  deleteAllOrders: async () => {
    try {
      const response = await api.delete("/dev/delete-all-orders");
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  createMassOrders: async (count, studentEmail) => {
    try {
      const response = await api.post("/dev/create-mass-orders", { count, studentEmail });
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  approveAllOrders: async () => {
    try {
      const response = await api.post("/dev/approve-all-orders");
      return response.data;
    } catch (error) {
      console.error(error)
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
      console.error(error)
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
      console.error(error)
      throw error;
    }
  },

  verifyOTPAndChangePassword: async (data) => {
    try {
      const response = await api.post("/otp/verify", data);
      return response.data;
    } catch (error) {
      console.error(error)
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
      console.error(error)
      throw error;
    }
  },

  resendVerification: async (email) => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  verifyEmail: async (userId, uniqueString) => {
    try {
      const response = await api.get(`/auth/verify/${userId}/${uniqueString}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  // Add refresh token endpoint
  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh-token");
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  // Get current user data
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  createSuperAdmin: async (adminData) => {
    try {
      const response = await api.post("/superadmin/create", adminData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },
};

// User API calls
export const userAPI = {
  // Staff User management (JobOrder and BAO)
  getAllStaffUsers: async () => {
    try {
      const response = await api.get("/users/staff");
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  getStaffUserById: async (id) => {
    try {
      const response = await api.get(`/users/staff/${id}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  createStaffUser: async (staffUserData) => {
    try {
      const response = await api.post("/users/staff", staffUserData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  updateStaffUser: async (id, staffUserData) => {
    try {
      const response = await api.put(`/users/staff/${id}`, staffUserData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  activateStaffUser: async (staffUserId) => {
    try {
      const response = await api.put(`/users/staff/${staffUserId}/activate`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  deactivateStaffUser: async (staffUserId, reason) => {
    try {
      const response = await api.put(`/users/staff/${staffUserId}/deactivate`, reason);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  deleteStaffUser: async (staffUserId) => {
    try {
      const response = await api.delete(`/users/staff/${staffUserId}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  // Student User management
  getAllStudents: async () => {
    try {
      const response = await api.get("/users/students");
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  getStudentById: async (id) => {
    try {
      const response = await api.get(`/users/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`/users/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  verifyStudent: async (id) => {
    try {
      const response = await api.put(`/users/students/${id}/verify`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  activateStudent: async (id) => {
    try {
      const response = await api.put(`/users/students/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  deactivateStudent: async (id, reason) => {
    try {
      const response = await api.put(`/users/students/${id}/deactivate`, { reason });
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/users/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  // JobOrder management
  getAllJobOrders: async () => {
    try {
      const response = await api.get("/users/job-orders");
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  getJobOrderById: async (id) => {
    try {
      const response = await api.get(`/users/job-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  createJobOrder: async (jobOrderData) => {
    try {
      const response = await api.post("/users/job-orders", jobOrderData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  updateJobOrder: async (id, jobOrderData) => {
    try {
      const response = await api.put(`/users/job-orders/${id}`, jobOrderData);
      return response.data;
    } catch (error) {
      console.error(error)
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
      console.error(error)
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
      console.error(error)
      throw error;
    }
  },

  deleteJobOrder: async (jobOrderId) => {
    try {
      const response = await api.delete(`/users/job-orders/${jobOrderId}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  // User profile management
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const response = await api.put(`/users/${userId}/profile`, profileData);
      return response.data;
    } catch (error) {
      console.error(error)
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
      console.error(error)
      throw error;
    }
  },

  // For Students - get their schedule by userId
  getMySchedule: async (userId) => {
    try {
      const response = await api.get(`/student-orders/schedules/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(error)
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
      console.error(error)
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/users/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/users/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  }
};

// Add this new export for employee management
export const employeeAPI = {
  getAllEmployees: async () => {
    try {
      const response = await api.get('/employees');
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  getActiveEmployees: async () => {
    try {
      const response = await api.get('/employees/active');
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  updateEmployeeStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/employees/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  },

  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  }
};

// Add this new export for contact form submissions
export const contactAPI = {
  submitContactForm: async (formData) => {
    try {
      const response = await api.post("/contact", formData);
      return response.data;
    } catch (error) {
      console.error("Error submitting contact form:", error);
      throw error;
    }
  }
};

export default api;
