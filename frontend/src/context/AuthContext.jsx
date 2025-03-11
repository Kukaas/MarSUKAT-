import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle logout
  const logout = useCallback(
    async (shouldCallAPI = true) => {
      try {
        if (shouldCallAPI) {
          await api.post("/auth/logout");
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setUser(null);
        // Navigate to login page after logout, preserving the current location for potential redirect back
        navigate("/login", {
          state: {
            from: location.pathname !== "/login" ? location : undefined,
          },
          replace: true,
        });
      }
    },
    [navigate, location]
  );

  // Setup axios interceptor for token refresh
  useEffect(() => {
    let refreshAttempts = 0;
    const MAX_REFRESH_ATTEMPTS = 3;
    let isRefreshingToken = false;

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't attempt refresh for logout requests
        if (originalRequest.url.includes("/auth/logout")) {
          return Promise.reject(error);
        }

        // If error is 401 and we haven't tried to refresh yet and it's not a refresh token request
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/refresh-token") &&
          refreshAttempts < MAX_REFRESH_ATTEMPTS &&
          !isRefreshingToken
        ) {
          originalRequest._retry = true;
          refreshAttempts++;

          try {
            isRefreshingToken = true;
            await api.post("/auth/refresh-token");
            isRefreshingToken = false;
            return api(originalRequest);
          } catch (refreshError) {
            isRefreshingToken = false;
            // If refresh fails, logout without calling API
            await logout(false);
            return Promise.reject(refreshError);
          }
        }

        // If we've exceeded max refresh attempts, logout without calling API
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          await logout(false);
          refreshAttempts = 0;
          return Promise.reject(new Error("Maximum refresh attempts exceeded"));
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Check authentication status on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        // Only log the error if it's not a 401 (unauthorized)
        if (error.response?.status !== 401) {
          console.error("Auth initialization error:", error);
        }
        // Clear user state if unauthorized
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData.user);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  if (loading) {
    return null; // Or a loading spinner component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
