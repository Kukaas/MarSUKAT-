import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { publicRoutes } from "./routes/publicRoutes";
import { studentRoutes } from "./routes/studentRoutes";
import { superAdminRoutes } from "./routes/superAdminRoutes";
import { jobOrderRoutes } from "./routes/jobOrderRoutes";
import DevModeWrapper from "./components/dev/DevModeWrapper";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  const getDefaultRoute = () => {
    if (!user) return "/login";
    const userId = user._id;
    switch (user.role) {
      case "Student":
        return `/student/dashboard/${userId}`;
      case "Admin":
        return "/admin/dashboard";
      case "JobOrder":
        return `/job-order/dashboard/${userId}`;
      case "SuperAdmin":
        return `/superadmin/dashboard/${userId}`;
      default:
        return "/login";
    }
  };

  return (
    <DevModeWrapper>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Student Routes */}
        {studentRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* SuperAdmin Routes */}
        {superAdminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Job Order Routes */}
        {jobOrderRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </DevModeWrapper>
  );
}
