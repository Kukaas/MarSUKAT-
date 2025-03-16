import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children, skipAuthCheck = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner component
  }

  if (skipAuthCheck) {
    return children;
  }

  if (user) {
    const userId = user._id;
    const from = location.state?.from;

    // If there's a saved location and it's not a public route, go there
    if (
      from &&
      !from.pathname.includes("/login") &&
      !from.pathname.includes("/signup")
    ) {
      return <Navigate to={from.pathname} replace />;
    }

    // Otherwise, redirect based on role
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
        return <Navigate to={`/superadmin/dashboard/${userId}`} replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}
