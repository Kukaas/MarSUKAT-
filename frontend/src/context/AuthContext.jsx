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
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Logo and spinning rings */}
      <div className="relative w-28 h-28">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-primary/20 animate-[spin_3s_linear_infinite]"></div>
        {/* Middle ring */}
        <div className="absolute inset-[6px] rounded-full border-[3px] border-primary/40 animate-[spin_2s_linear_infinite_reverse]"></div>
        {/* Inner ring */}
        <div className="absolute inset-3 rounded-full border-[3px] border-primary/60 animate-[spin_4s_linear_infinite]"></div>
        
        {/* Logo */}
        <div className="absolute inset-0 m-auto w-16 h-16">
          <img 
            src="/msc_logo.jpg" 
            alt="MSC Logo" 
            className="w-full h-full object-cover rounded-full shadow-lg animate-pulse"
          />
        </div>
      </div>

      {/* Text and loading dots */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-semibold text-primary">Loading...</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we fetch your data
        </p>
        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Add keyframes for the bounce animation
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
`;
document.head.appendChild(style);

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

  if (loading) {
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
