import { Navigate } from "react-router-dom";
import PublicRoute from "../components/PublicRoute";
import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import SignUp from "../pages/public/SignUp";
import VerificationSuccess from "../pages/public/VerificationSuccess";
import VerificationError from "../pages/public/VerificationError";
import RequestOtp from "../pages/public/RequestOtp";
import VerifyOtp from "../pages/public/VerifyOtp";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Faq from "../pages/public/Faq";
import CreateSuperAdmin from "../pages/private/superadmin/pages/CreateSuperAdmin";

export const publicRoutes = [
  {
    path: "/create-super-admin",
    element: (
      <PublicRoute skipAuthCheck={true}>
        <CreateSuperAdmin />
      </PublicRoute>
    ),
  },
  {
    path: "/verification-success",
    element: <VerificationSuccess />,
  },
  {
    path: "/verification-error",
    element: <VerificationError />,
  },
  {
    path: "/api/v1/auth/verify/:userId/:uniqueString",
    element: <VerificationSuccess />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignUp />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <PublicRoute>
        <Home />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <RequestOtp />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-otp/:userId",
    element: (
      <PublicRoute>
        <VerifyOtp />
      </PublicRoute>
    ),
  },
  {
    path: "/about",
    element: (
      <PublicRoute>
        <About />
      </PublicRoute>
    ),
  },
  {
    path: "/contact-us",
    element: (
      <PublicRoute>
        <Contact />
      </PublicRoute>
    ),
  },
  {
    path: "/faq",
    element: (
      <PublicRoute>
        <Faq />
      </PublicRoute>
    ),
  },
];
