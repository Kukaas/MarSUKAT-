import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

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
import CreateJobOrder from "./pages/private/superadmin/pages/CreateJobOrder";
import Department from "./pages/private/superadmin/pages/Department";
import DepartmentLevelOptions from "./pages/private/superadmin/pages/DepartmentLevelOptions";
import Units from "./pages/private/superadmin/pages/Units";
import Categories from "./pages/private/superadmin/pages/Categories";
import Sizes from "./pages/private/superadmin/pages/Sizes";
import Prices from "./pages/private/superadmin/pages/Prices";

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
      {/* Always Accessible Routes */}
      <Route
        path="/create-super-admin"
        element={
          <PublicRoute skipAuthCheck={true}>
            <CreateSuperAdmin />
          </PublicRoute>
        }
      />
      <Route path="/verification-success" element={<VerificationSuccess />} />
      <Route path="/verification-error" element={<VerificationError />} />
      <Route
        path="/api/v1/auth/verify/:userId/:uniqueString"
        element={<VerificationSuccess />}
      />

      {/* Public Routes - Redirect to dashboard if authenticated */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <RequestOtp />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-otp/:userId"
        element={
          <PublicRoute>
            <VerifyOtp />
          </PublicRoute>
        }
      />
      <Route
        path="/about"
        element={
          <PublicRoute>
            <About />
          </PublicRoute>
        }
      />
      <Route
        path="/contact-us"
        element={
          <PublicRoute>
            <Contact />
          </PublicRoute>
        }
      />
      <Route
        path="/faq"
        element={
          <PublicRoute>
            <Faq />
          </PublicRoute>
        }
      />

      {/* Private Routes - Require Authentication */}
      <Route
        path="/student/dashboard/:id"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/orders/:id"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/schedules/:id"
        element={
          <PrivateRoute>
            <Schedule />
          </PrivateRoute>
        }
      />

      {/* SuperAdmin Routes */}
      <Route
        path="/superadmin/dashboard/:id"
        element={
          <PrivateRoute>
            <SuperAdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/superadmin/create-job-order"
        element={
          <PrivateRoute>
            <CreateJobOrder />
          </PrivateRoute>
        }
      />
      <Route
        path="/superadmin/maintenance/levels"
        element={
          <PrivateRoute>
            <Level />
          </PrivateRoute>
        }
      />
      <Route
        path="/superadmin/maintenance/departments"
        element={
          <PrivateRoute>
            <Department />
          </PrivateRoute>
        }
      />
      <Route
        path="/superadmin/maintenance/department-levels"
        element={
          <PrivateRoute>
            <DepartmentLevelOptions />
          </PrivateRoute>
        }
      />
      <Route
        path="/superadmin/maintenance/units"
        element={
          <PrivateRoute>
            <Units />
          </PrivateRoute>
        }
      />
      <Route
        path="/superadmin/maintenance/categories"
        element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        }
      />
      <Route
        path="/superadmin/maintenance/sizes"
        element={
          <PrivateRoute>
            <Sizes />
          </PrivateRoute>
        }
      />
      <Route
        path="/superadmin/maintenance/prices"
        element={
          <PrivateRoute>
            <Prices />
          </PrivateRoute>
        }
      />

      {/* Catch all route - Skip redirect for public routes */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}
