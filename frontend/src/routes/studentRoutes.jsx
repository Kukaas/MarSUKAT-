import Dashboard from "../pages/private/student/pages/Dashboard";
import Orders from "../pages/private/student/pages/Orders";
import Schedule from "../pages/private/student/pages/Schedule";

export const studentRoutes = [
  {
    path: "/student/dashboard/:id",
    element: <Dashboard />,
  },
  {
    path: "/student/orders/:id",
    element: <Orders />,
  },
  {
    path: "/student/schedules/:id",
    element: <Schedule />,
  },
];
