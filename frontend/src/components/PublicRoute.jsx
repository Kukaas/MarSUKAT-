import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/roleNavigation";
import Cookies from "js-cookie";

export default function PublicRoute({ children, skipAuthCheck = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check for tokens
  const hasTokens = Cookies.get("access_token") || Cookies.get("refresh_token");

  if (loading) {
    return null;
  }

  if (skipAuthCheck) {
    return children;
  }

  // If user is authenticated or has tokens, redirect appropriately
  if (user || hasTokens) {
    const userId = user?._id;

    // If we have a user object, use their role for redirection
    if (user?.role) {
      return <Navigate to={getDashboardPath(user.role, userId)} replace />;
    }

    // If we have tokens but no user object yet
    if (hasTokens) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
