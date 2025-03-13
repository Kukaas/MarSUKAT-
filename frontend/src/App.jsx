import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { publicRoutes } from "./routes/publicRoutes";
import { studentRoutes } from "./routes/studentRoutes";
import { superAdminRoutes } from "./routes/superAdminRoutes";

// Route Guards
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// Private Pages
import Dashboard from "./pages/private/student/pages/Dashboard";
import Orders from "./pages/private/student/pages/Orders";
import Schedule from "./pages/private/student/pages/Schedule";
import CreateSuperAdmin from "./pages/private/superadmin/pages/CreateSuperAdmin";
import SuperAdminDashboard from "./pages/private/superadmin/pages/Dashboard";
import Level from "./pages/private/superadmin/pages/Level";
import Department from "./pages/private/superadmin/pages/Department";
import DepartmentLevelOptions from "./pages/private/superadmin/pages/DepartmentLevelOptions";
import Units from "./pages/private/superadmin/pages/Units";
import Categories from "./pages/private/superadmin/pages/Categories";
import Sizes from "./pages/private/superadmin/pages/Sizes";
import Prices from "./pages/private/superadmin/pages/Prices";
import RawMaterialTypes from "./pages/private/superadmin/pages/RawMaterialTypes";
import ProductTypes from "./pages/private/superadmin/pages/ProductTypes";
import JobOrders from "./pages/private/superadmin/pages/JobOrders";

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import SignUp from "./pages/public/SignUp";
import VerificationSuccess from "./pages/public/VerificationSuccess";
import VerificationError from "./pages/public/VerificationError";
import RequestOtp from "./pages/public/RequestOtp";
import VerifyOtp from "./pages/public/VerifyOtp";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Faq from "./pages/public/Faq";

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
      case "Staff":
        return "/staff/dashboard";
      case "SuperAdmin":
        return `/superadmin/dashboard/${userId}`;
      default:
        return "/login";
    }
  };

  return (
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

      {/* Catch all route */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}
