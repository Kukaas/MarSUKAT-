import Dashboard from "@/pages/private/bao/pages/Dashboard";
import SchoolUniformProduction from "@/pages/private/bao/pages/SchoolUniformProduction";
import RawMaterialsInventory from "@/pages/private/bao/pages/RawMaterialsInventory";
import SchoolUniformInventory from "@/pages/private/bao/pages/SchoolUniformInventory";
import SalesReport from "@/pages/private/bao/pages/SalesReport";
import AcademicGownProduction from "@/pages/private/bao/pages/AcademicGownProduction";
import AcademicGownInventory from "@/pages/private/bao/pages/AcademicGownInventory";
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
    path: "/bao/productions/academic-gowns",
    element: <AcademicGownProduction />,
  },
  {
    path: "/bao/inventory/raw-materials",
    element: <RawMaterialsInventory />,
  },
  {
    path: "/bao/inventory/school-uniforms",
    element: <SchoolUniformInventory />,
  },
  {
    path: "/bao/inventory/academic-gowns",
    element: <AcademicGownInventory />,
  },
  {
    path: "/bao/reports/sales",
    element: <SalesReport />,
  },
];
