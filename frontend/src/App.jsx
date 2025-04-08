import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { publicRoutes } from "./routes/publicRoutes";
import { studentRoutes } from "./routes/studentRoutes";
import { superAdminRoutes } from "./routes/superAdminRoutes";
import { jobOrderRoutes } from "./routes/jobOrderRoutes";
import DevModeWrapper from "./components/dev/DevModeWrapper";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { baoRoutes } from "./routes/baoRoutes";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { coordinatorRoutes } from "./routes/coordinatorRoutes";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Marinduque State University",
  "image": "https://marsukat.vercel.app/src/assets/marsu_logo.jpg",
  "url": "https://marsukat.vercel.app",
  "description": "Official production monitoring, inventory management, and reporting system for Marinduque State University",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Boac",
    "addressRegion": "Marinduque",
    "postalCode": "4900",
    "addressCountry": "PH"
  }
};

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Helmet>
          <html lang="en" />
          <link rel="canonical" href={`https://marsukat.vercel.app${location.pathname}`} />
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>
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

            {/*Coordinator Routes */}
            {coordinatorRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<PrivateRoute>{route.element}</PrivateRoute>}
              />
            ))}
          </Routes>
        </DevModeWrapper>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
