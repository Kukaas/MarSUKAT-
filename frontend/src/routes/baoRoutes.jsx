import Dashboard from "@/pages/private/bao/pages/Dashboard";
import SchoolUniformProduction from "@/pages/private/bao/pages/SchoolUniformProduction";
export const baoRoutes = [
  {
    path: "/bao/dashboard/:id",
    element: <Dashboard />,
  },
  {
    path: "/bao/productions/school-uniforms",
    element: <SchoolUniformProduction />,
  },
];
