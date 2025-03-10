import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API calls
export const authAPI = {
  signup: async (userData) => {
    try {
      const response = await api.post("/auth/signup", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Network error occurred" };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Network error occurred" };
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Network error occurred" };
    }
  },

  verifyEmail: async (userId, uniqueString) => {
    try {
      const response = await api.get(`/auth/verify/${userId}/${uniqueString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Network error occurred" };
    }
  },
};

export default api;
