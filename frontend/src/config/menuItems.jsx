import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Users,
  Settings,
  Store,
  Scissors,
  ClipboardList,
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
  Admin: [
    {
      title: "Dashboard",
      icon: <LayoutDashboard />,
      path: () => "/admin/dashboard",
      description: "Overview of system",
    },
    {
      title: "Users",
      icon: <Users />,
      path: () => "/admin/users",
      description: "Manage system users",
    },
    {
      title: "Products",
      icon: <Store />,
      path: () => "/admin/products",
      description: "Manage products",
    },
    {
      title: "Orders",
      icon: <ShoppingBag />,
      path: () => "/admin/orders",
      description: "View all orders",
    },
    {
      title: "Settings",
      icon: <Settings />,
      path: () => "/admin/settings",
      description: "System settings",
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
