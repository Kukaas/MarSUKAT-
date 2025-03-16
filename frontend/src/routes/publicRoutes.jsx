import { Navigate } from "react-router-dom";
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
import NotFound from "../pages/public/NotFound";

export const publicRoutes = [
  {
    path: "/create-super-admin",
    element: <CreateSuperAdmin />,
    skipAuthCheck: true,
  },
  {
    path: "/verification-success",
    element: <VerificationSuccess />,
    skipAuthCheck: true,
  },
  {
    path: "/verification-error",
    element: <VerificationError />,
    skipAuthCheck: true,
  },
  {
    path: "/api/v1/auth/verify/:userId/:uniqueString",
    element: <VerificationSuccess />,
    skipAuthCheck: true,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/forgot-password",
    element: <RequestOtp />,
  },
  {
    path: "/verify-otp/:userId",
    element: <VerifyOtp />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact-us",
    element: <Contact />,
  },
  {
    path: "/faq",
    element: <Faq />,
  },
  {
    path: "*",
    element: <NotFound />,
    skipAuthCheck: true,
  },
];
