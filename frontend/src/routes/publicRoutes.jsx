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
          <meta name="description" content="Secure login portal for MarSUKAT - Access production monitoring, inventory management, and student services for Marinduque State University" />
        </Helmet>
        <Login />
      </>
    ),
  },
  {
    path: "/signup",
    element: (
      <>
        <Helmet>
          <title>{getTitleFromPath("/signup")}</title>
          <meta name="description" content="Register for MarSUKAT - Join Marinduque State University's comprehensive system for production monitoring, inventory management, and student services" />
        </Helmet>
        <SignUp />
      </>
    ),
  },
  {
    path: "/",
    element: (
      <>
        <Helmet>
          <title>{getTitleFromPath("/")}</title>
          <meta name="description" content="MarSUKAT - Comprehensive system for Marinduque State University featuring production monitoring, inventory management, and reporting tools. Access student ordering, measurement scheduling, and rental tracking services." />
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
    element: (
      <>
        <Helmet>
          <title>{getTitleFromPath("/contact-us")}</title>
          <meta name="description" content="Get in touch with MarSUKAT support team at Marinduque State University for assistance with production monitoring, inventory management, and student services" />
        </Helmet>
        <Contact />
      </>
    ),
  },
  {
    path: "/faq",
    element: (
      <>
        <Helmet>
          <title>{getTitleFromPath("/faq")}</title>
          <meta name="description" content="Frequently Asked Questions about MarSUKAT - Learn more about MSU's production monitoring, inventory management, and student services platform" />
        </Helmet>
        <Faq />
      </>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
    skipAuthCheck: true,
  },
];
