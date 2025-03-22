import Dashboard from "@/pages/private/bao/pages/Dashboard";
import SchoolUniformProduction from "@/pages/private/bao/pages/SchoolUniformProduction";
import RawMaterialsInventory from "@/pages/private/bao/pages/RawMaterialsInventory";

export const baoRoutes = [
  {
    path: "/bao/dashboard/:id",
    element: <Dashboard />,
  },
  {
    path: "/bao/productions/school-uniforms",
    element: <SchoolUniformProduction />,
  },
  {
    path: "/bao/inventory/raw-materials",
    element: <RawMaterialsInventory />,
  },
];
