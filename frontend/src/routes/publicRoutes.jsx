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
import { Helmet } from 'react-helmet-async';
import { getTitleFromPath } from '../utils/getTitleFromPath';

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
    element: (
      <>
        <Helmet>
          <title>{getTitleFromPath("/login")}</title>
          <meta name="description" content="Secure login portal for Marinduque State University's production management system" />
        </Helmet>
        <Login />
      </>
    ),
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/",
    element: (
      <>
        <Helmet>
          <title>{getTitleFromPath("/")}</title>
          <meta name="description" content="Marinduque State University's official production monitoring and inventory management portal" />
        </Helmet>
        <Home />
      </>
    ),
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
    element: (
      <>
        <Helmet>
          <title>{getTitleFromPath("/about")}</title>
          <meta name="description" content="Learn about MarSUKAT - Marinduque State University's integrated solution for academic resource management" />
        </Helmet>
        <About />
      </>
    ),
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
