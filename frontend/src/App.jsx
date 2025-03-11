import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

// Route Guards
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// Private Pages
import Dashboard from "./pages/private/Dashboard";

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import SignUp from "./pages/public/SignUp";
import VerificationSuccess from "./pages/public/VerificationSuccess";
import VerificationError from "./pages/public/VerificationError";

export default function App() {
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

      {/* Private Routes - Require authentication */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Landing Page - Redirect to dashboard if authenticated, otherwise show home */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      {/* Catch all route - Redirect to dashboard if authenticated, otherwise to login */}
      <Route
        path="*"
        element={
          <PrivateRoute>
            <Navigate to="/dashboard" replace />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
