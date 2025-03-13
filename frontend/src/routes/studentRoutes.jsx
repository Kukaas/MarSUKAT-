import PrivateRoute from "../components/PrivateRoute";
import Dashboard from "../pages/private/student/pages/Dashboard";
import Orders from "../pages/private/student/pages/Orders";
import Schedule from "../pages/private/student/pages/Schedule";

export const studentRoutes = [
  {
    path: "/student/dashboard/:id",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/orders/:id",
    element: (
      <PrivateRoute>
        <Orders />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/schedules/:id",
    element: (
      <PrivateRoute>
        <Schedule />
      </PrivateRoute>
    ),
  },
];
