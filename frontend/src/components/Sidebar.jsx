import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuItems } from "../config/menuItems";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "./ui/sidebar";

export default function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || "Student";
  const userId = user?._id;

  const currentMenuItems = menuItems[role] || [];

  // Generate the current path with actual user ID
  const getCurrentPath = (pathFn) => {
    return role === "Student" ? pathFn(userId) : pathFn();
  };

  return (
    <div className="hidden md:block h-full">
      <SidebarProvider>
        <Sidebar className="border-r h-full">
          <SidebarHeader className="border-b px-4">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-xl py-4"
              >
                <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                  MarSUKAT
                </span>
              </Link>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {currentMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === getCurrentPath(item.path)}
                  >
                    <Link to={getCurrentPath(item.path)}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
