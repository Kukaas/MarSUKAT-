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
