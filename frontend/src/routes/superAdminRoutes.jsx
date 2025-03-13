import PrivateRoute from "../components/PrivateRoute";
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

export const superAdminRoutes = [
  {
    path: "/superadmin/dashboard/:id",
    element: (
      <PrivateRoute>
        <SuperAdminDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/create-job-order",
    element: (
      <PrivateRoute>
        <JobOrders />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/levels",
    element: (
      <PrivateRoute>
        <Level />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/departments",
    element: (
      <PrivateRoute>
        <Department />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/department-levels",
    element: (
      <PrivateRoute>
        <DepartmentLevelOptions />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/units",
    element: (
      <PrivateRoute>
        <Units />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/categories",
    element: (
      <PrivateRoute>
        <Categories />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/sizes",
    element: (
      <PrivateRoute>
        <Sizes />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/prices",
    element: (
      <PrivateRoute>
        <Prices />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/raw-material-types",
    element: (
      <PrivateRoute>
        <RawMaterialTypes />
      </PrivateRoute>
    ),
  },
  {
    path: "/superadmin/maintenance/product-types",
    element: (
      <PrivateRoute>
        <ProductTypes />
      </PrivateRoute>
    ),
  },
];
