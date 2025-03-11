import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Users,
  Settings,
  Store,
  Scissors,
  ClipboardList,
  UserPlus,
  Wrench,
  Building2,
  Package,
  Boxes,
  Box,
  DollarSign,
  Ruler,
} from "lucide-react";

export const menuItems = {
  Student: [
    {
      title: "Dashboard",
      icon: <LayoutDashboard />,
      path: (id) => `/student/dashboard/${id}`,
      description: "View your dashboard",
    },
    {
      title: "Orders",
      icon: <ShoppingBag />,
      path: (id) => `/student/orders/${id}`,
      description: "Manage your orders",
    },
    {
      title: "Schedules",
      icon: <Calendar />,
      path: (id) => `/student/schedules/${id}`,
      description: "View your schedules",
    },
  ],
  SuperAdmin: [
    {
      title: "Dashboard",
      icon: <LayoutDashboard />,
      path: (id) => `/superadmin/dashboard/${id}`,
      description: "Overview of system",
    },
    {
      title: "Create Job Order",
      icon: <UserPlus />,
      path: () => "/superadmin/create-job-order",
      description: "Create a new job order",
    },
    {
      title: "Create Super Admin",
      icon: <UserPlus />,
      path: () => "/superadmin/create-super-admin",
      description: "Create a new super admin",
    },
    {
      title: "Maintenance",
      icon: <Wrench />,
      type: "accordion",
      items: [
        {
          title: "Levels",
          icon: <Building2 />,
          path: () => "/superadmin/maintenance/levels",
          description: "Manage levels",
        },
        {
          title: "Departments",
          icon: <Store />,
          path: () => "/superadmin/maintenance/departments",
          description: "Manage departments",
        },
        {
          title: "Department Levels Options",
          icon: <Building2 />,
          path: () => "/superadmin/maintenance/department-levels",
          description: "Manage department levels",
        },
        {
          title: "Product Types",
          icon: <Package />,
          path: () => "/superadmin/maintenance/product-types",
          description: "Manage product types",
        },
        {
          title: "Raw Material Type",
          icon: <Boxes />,
          path: () => "/superadmin/maintenance/raw-material-types",
          description: "Manage raw material types",
        },
        {
          title: "Raw Material Category",
          icon: <Box />,
          path: () => "/superadmin/maintenance/raw-material-categories",
          description: "Manage raw material categories",
        },
        {
          title: "Prices",
          icon: <DollarSign />,
          path: () => "/superadmin/maintenance/prices",
          description: "Manage prices",
        },
        {
          title: "Sizes",
          icon: <Ruler />,
          path: () => "/superadmin/maintenance/sizes",
          description: "Manage sizes",
        },
      ],
    },
  ],
  Staff: [
    {
      title: "Dashboard",
      icon: <LayoutDashboard />,
      path: () => "/staff/dashboard",
      description: "Staff overview",
    },
    {
      title: "Orders",
      icon: <ShoppingBag />,
      path: () => "/staff/orders",
      description: "Process orders",
    },
    {
      title: "Production",
      icon: <Scissors />,
      path: () => "/staff/production",
      description: "Production management",
    },
    {
      title: "Tasks",
      icon: <ClipboardList />,
      path: () => "/staff/tasks",
      description: "View assigned tasks",
    },
  ],
};
