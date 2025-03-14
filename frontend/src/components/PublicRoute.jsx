import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children, skipAuthCheck = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner component
  }

  // Skip auth check if skipAuthCheck is true
  if (skipAuthCheck) {
    return children;
  }

  // If user is authenticated and trying to access login/signup/home, redirect to their dashboard
  if (user && ["/login", "/signup", "/"].includes(location.pathname)) {
    const userId = user._id;
    switch (user.role) {
      case "Student":
        return <Navigate to={`/student/dashboard/${userId}`} replace />;
      case "Admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "JobOrder":
        return <Navigate to={`/job-order/dashboard/${userId}`} replace />;
      case "Staff":
        return <Navigate to="/staff/dashboard" replace />;
      case "SuperAdmin":
        return <Navigate to="/superadmin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}
