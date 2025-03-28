import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@/lib/api";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { navigateToRoleDashboard } from "../utils/roleNavigation";

const AuthContext = createContext();

// Routes that don't require authentication check
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/create-super-admin",
  "/verification-success",
  "/verification-error",
  "/forgot-password",
  "/verify-otp/:userId",
  "/about",
  "/contact-us",
  "/faq"
];

// Loading component
const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we fetch your data...
        </p>
      </div>
    </div>
  </div>
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to check if current path matches any public route pattern
  const isPublicRoute = (pathname) => {
    const isPublic = PUBLIC_ROUTES.some((route) => matchPath({ path: route }, pathname));
    return isPublic;
  };

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

  // Setup axios interceptor for unauthorized responses
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !isPublicRoute(location.pathname)) {
          await logout(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout, location]);

  // Check authentication status on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
        if (!isPublicRoute(location.pathname)) {
          navigate("/login", { state: { from: location.pathname }, replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData) => {
    try {
      setUser(userData.user);
      navigateToRoleDashboard(navigate, userData.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const updateUserInfo = useCallback((updatedUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
      photo: updatedUserData.photo,
    }));
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    updateUserInfo,
  };

  if (loading && !isPublicRoute(location.pathname)) {
    return <LoadingScreen />;
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
