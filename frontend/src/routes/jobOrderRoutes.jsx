import Dashboard from "@/pages/private/joborder/pages/Dashboard";
import { StudentOrders } from "@/pages/private/joborder/pages/StudentOrders";
import { CommercialOrders } from "@/pages/private/joborder/pages/CommercialOrders";
import { Rentals } from "@/pages/private/joborder/pages/Rentals";
import { Schedules } from "@/pages/private/joborder/pages/Schedules";
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
import RawMaterialsInventory from "@/pages/private/joborder/pages/RawMaterialsInventory";

export const jobOrderRoutes = [
  {
    path: "/job-order/dashboard/:id",
    element: <Dashboard />
  },
  {
    path: "/job-order/student-orders",
    element: <StudentOrders />
  },
  {
    path: "/job-order/commercial-orders",
    element: <CommercialOrders />
  },
  {
    path: "/job-order/rentals",
    element: <Rentals />
  },
  {
    path: "/job-order/schedules",
    element: <Schedules />
  },
  {
    path: "/job-order/productions/school-uniforms",
    element: <SchoolUniformProduction />
  },
  {
    path: "/job-order/productions/commercial-jobs",
    element: <CommercialJobProduction />
  },
  {
    path: "/job-order/productions/others",
    element: <OthersProduction />
  },
  {
    path: "/job-order/productions/academic-gowns",
    element: <AcademicGownProduction />
  },
  {
    path: "/job-order/inventory/raw-materials",
    element: <RawMaterialsInventory />
  },
  {
    path: "/job-order/inventory/school-uniforms",
    element: <SchoolUniformInventory />
  },
  {
    path: "/job-order/inventory/academic-gowns",
    element: <AcademicGownInventory />
  },
  {
    path: "/job-order/inventory/commercial-jobs",
    element: <CommercialJobInventory />
  },
  {
    path: "/job-order/inventory/others",
    element: <OthersInventory />
  },
  {
    path: "/job-order/reports/sales",
    element: <SalesReport />
  },
  {
    path: "/job-order/reports/accomplishments",
    element: <AccomplishmentReport />
  },
];
