import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { publicRoutes } from "./routes/publicRoutes";
import { studentRoutes } from "./routes/studentRoutes";
import { superAdminRoutes } from "./routes/superAdminRoutes";
import { jobOrderRoutes } from "./routes/jobOrderRoutes";
import DevModeWrapper from "./components/dev/DevModeWrapper";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { baoRoutes } from "./routes/baoRoutes";

export default function App() {
  const { user } = useAuth();

  return (
    <DevModeWrapper>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PublicRoute skipAuthCheck={route.skipAuthCheck}>
                {route.element}
              </PublicRoute>
            }
          />
        ))}

        {/* Protected Routes */}
        {/* Student Routes */}
        {studentRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<PrivateRoute>{route.element}</PrivateRoute>}
          />
        ))}

        {/* SuperAdmin Routes */}
        {superAdminRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<PrivateRoute>{route.element}</PrivateRoute>}
          />
        ))}

        {/* Job Order Routes */}
        {jobOrderRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<PrivateRoute>{route.element}</PrivateRoute>}
          />
        ))}

        {/* BAO Routes */}
        {baoRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<PrivateRoute>{route.element}</PrivateRoute>}
          />
        ))}
      </Routes>
    </DevModeWrapper>
  );
}
