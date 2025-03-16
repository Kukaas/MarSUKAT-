import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath, rolePathMap } from "../utils/roleNavigation";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner component
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is trying to access a route matching their role
  const currentPath = location.pathname.toLowerCase();
  const userRole = user.role.toLowerCase();

  // Get the expected path prefix for the user's role
  const expectedPathPrefix = rolePathMap[userRole];

  // If user is trying to access a route that doesn't match their role
  if (!currentPath.startsWith(expectedPathPrefix)) {
    return <Navigate to={getDashboardPath(userRole, user._id)} replace />;
  }

  return children;
}
