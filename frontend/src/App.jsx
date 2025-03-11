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

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import SignUp from "./pages/public/SignUp";
import VerificationSuccess from "./pages/public/VerificationSuccess";
import VerificationError from "./pages/public/VerificationError";

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
        return "/superadmin/dashboard";
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

      {/* Catch all route - Skip redirect for public routes */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}
