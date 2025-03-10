import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Private Pages
import Dashboard from "./pages/private/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

// Public Pages
import Home from "./pages/public/Home";
import SignUp from "./pages/public/SignUp";
import VerificationSuccess from "./pages/public/VerificationSuccess";
import VerificationError from "./pages/public/VerificationError";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        {/* <Route path="/login" element={<Login />} /> */}

        {/* Verification Routes */}
        <Route path="/verification-success" element={<VerificationSuccess />} />
        <Route path="/verification-error" element={<VerificationError />} />
        {/* Legacy verification route - will be redirected by backend */}
        <Route
          path="/api/v1/auth/verify/:userId/:uniqueString"
          element={<VerificationSuccess />}
        />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logout" element={<Logout />} /> */}
      </Routes>
    </Router>
  );
}
