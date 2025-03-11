import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Route Guards
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// Private Pages
import Dashboard from "./pages/private/student/pages/Dashboard";
import Orders from "./pages/private/student/pages/Orders";
import Schedule from "./pages/private/student/pages/Schedule";

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import SignUp from "./pages/public/SignUp";
import VerificationSuccess from "./pages/public/VerificationSuccess";
import VerificationError from "./pages/public/VerificationError";

export default function App() {
  const { user } = useAuth();

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
      default:
        return "/login";
    }
  };

  return (
    <Routes>
      {/* Public Routes - Accessible only when not logged in */}
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

      {/* Verification Routes - Always accessible */}
      <Route path="/verification-success" element={<VerificationSuccess />} />
      <Route path="/verification-error" element={<VerificationError />} />
      <Route
        path="/api/v1/auth/verify/:userId/:uniqueString"
        element={<VerificationSuccess />}
      />

      {/* Student Routes */}
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

      {/* Landing Page - Redirect to role-specific dashboard if authenticated */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      {/* Catch all route - Redirect to role-specific dashboard if authenticated */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}
