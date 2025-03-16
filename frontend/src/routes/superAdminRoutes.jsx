import SuperAdminDashboard from "../pages/private/superadmin/pages/Dashboard";
import Level from "../pages/private/superadmin/pages/Level";
import Department from "../pages/private/superadmin/pages/Department";
import DepartmentLevelOptions from "../pages/private/superadmin/pages/DepartmentLevelOptions";
import Units from "../pages/private/superadmin/pages/Units";
import Categories from "../pages/private/superadmin/pages/Categories";
import Sizes from "../pages/private/superadmin/pages/Sizes";
import Prices from "../pages/private/superadmin/pages/Prices";
import RawMaterialTypes from "../pages/private/superadmin/pages/RawMaterialTypes";
import ProductTypes from "../pages/private/superadmin/pages/ProductTypes";
import JobOrders from "../pages/private/superadmin/pages/JobOrders";
import { StudentAnnouncement } from "../pages/private/superadmin/pages/StudentAnnouncement";
import { StudentUser } from "../pages/private/superadmin/pages/StudentUser";
import { ProductManagement } from "../pages/private/superadmin/pages/ProductManagement";

export const superAdminRoutes = [
  {
    path: "/superadmin/dashboard/:id",
    element: <SuperAdminDashboard />,
  },
  {
    path: "/superadmin/create-job-order",
    element: <JobOrders />,
  },
  {
    path: "/superadmin/maintenance/levels",
    element: <Level />,
  },
  {
    path: "/superadmin/maintenance/departments",
    element: <Department />,
  },
  {
    path: "/superadmin/maintenance/department-levels",
    element: <DepartmentLevelOptions />,
  },
  {
    path: "/superadmin/maintenance/units",
    element: <Units />,
  },
  {
    path: "/superadmin/maintenance/categories",
    element: <Categories />,
  },
  {
    path: "/superadmin/maintenance/sizes",
    element: <Sizes />,
  },
  {
    path: "/superadmin/maintenance/prices",
    element: <Prices />,
  },
  {
    path: "/superadmin/maintenance/raw-material-types",
    element: <RawMaterialTypes />,
  },
  {
    path: "/superadmin/maintenance/product-types",
    element: <ProductTypes />,
  },
  {
    path: "/superadmin/students/product-management",
    element: <ProductManagement />,
  },
  {
    path: "/superadmin/students/announcements",
    element: <StudentAnnouncement />,
  },
  {
    path: "/superadmin/students/users",
    element: <StudentUser />,
  },
];
