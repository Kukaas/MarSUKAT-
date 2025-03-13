import PrivateRoute from "@/components/PrivateRoute";
import { CommercialOrders } from "@/pages/private/joborder/CommercialOrders";
import { Dashboard } from "@/pages/private/joborder/Dashboard";
import { Rentals } from "@/pages/private/joborder/Rentals";
import { Schedules } from "@/pages/private/joborder/Schedules";
import { StudentOrders } from "@/pages/private/joborder/StudentOrders";

export const jobOrderRoutes = [
  {
    path: "/job-order/dashboard/:id",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/student-orders",
    element: (
      <PrivateRoute>
        <StudentOrders />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/commercial-orders",
    element: (
      <PrivateRoute>
        <CommercialOrders />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/rentals",
    element: (
      <PrivateRoute>
        <Rentals />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/schedules",
    element: (
      <PrivateRoute>
        <Schedules />
      </PrivateRoute>
    ),
  },
];
