import PrivateRoute from "@/components/PrivateRoute";
import { Dashboard } from "@/pages/private/joborder/pages/Dashboard";
import { StudentOrders } from "@/pages/private/joborder/pages/StudentOrders";
import { CommercialOrders } from "@/pages/private/joborder/pages/CommercialOrders";
import { Rentals } from "@/pages/private/joborder/pages/Rentals";
import { Schedules } from "@/pages/private/joborder/pages/Schedules";
import { RawMaterialsInventory } from "@/pages/private/joborder/pages/RawMaterialsInventory";
import { SchoolUniformInventory } from "@/pages/private/joborder/pages/SchoolUniformInventory";
import { AcademicGownInventory } from "@/pages/private/joborder/pages/AcademicGownInventory";
import { CommercialJobInventory } from "@/pages/private/joborder/pages/CommercialJobInventory";
import { OthersInventory } from "@/pages/private/joborder/pages/OthersInventory";
import { SalesReport } from "@/pages/private/joborder/pages/SalesReport";
import { AccomplishmentReport } from "@/pages/private/joborder/pages/AccomplishmentReport";
import { SchoolUniformProduction } from "@/pages/private/joborder/pages/SchoolUniformProduction";
import { AcademicGownProduction } from "@/pages/private/joborder/pages/AcademicGownProduction";
import { CommercialJobProduction } from "@/pages/private/joborder/pages/CommercialJobProduction";
import { OthersProduction } from "@/pages/private/joborder/pages/OthersProduction";

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
  {
    path: "/job-order/productions/school-uniforms",
    element: (
      <PrivateRoute>
        <SchoolUniformProduction />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/productions/commercial-jobs",
    element: (
      <PrivateRoute>
        <CommercialJobProduction />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/productions/others",
    element: (
      <PrivateRoute>
        <OthersProduction />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/productions/academic-gowns",
    element: (
      <PrivateRoute>
        <AcademicGownProduction />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/inventory/raw-materials",
    element: (
      <PrivateRoute>
        <RawMaterialsInventory />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/inventory/school-uniforms",
    element: (
      <PrivateRoute>
        <SchoolUniformInventory />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/inventory/academic-gowns",
    element: (
      <PrivateRoute>
        <AcademicGownInventory />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/inventory/commercial-jobs",
    element: (
      <PrivateRoute>
        <CommercialJobInventory />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/inventory/others",
    element: (
      <PrivateRoute>
        <OthersInventory />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/reports/sales",
    element: (
      <PrivateRoute>
        <SalesReport />
      </PrivateRoute>
    ),
  },
  {
    path: "/job-order/reports/accomplishments",
    element: (
      <PrivateRoute>
        <AccomplishmentReport />
      </PrivateRoute>
    ),
  },
];
