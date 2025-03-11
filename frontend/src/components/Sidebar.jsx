import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuItems } from "../config/menuItems";

export default function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || "Student";
  const userId = user?._id;

  const currentMenuItems = menuItems[role] || [];

  const getCurrentPath = (pathFn) => {
    return role === "Student" ? pathFn(userId) : pathFn();
  };

  return (
    <div className="hidden md:flex h-full flex-col bg-white border-r border-gray-100">
      <nav className="flex-1 px-3 pt-6">
        {currentMenuItems.map((item) => {
          const isActive = location.pathname === getCurrentPath(item.path);
          return (
            <Link
              key={item.title}
              to={getCurrentPath(item.path)}
              className={`flex items-center gap-3 px-4 py-2.5 mb-1 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-gray-50 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-900"
              }`}
            >
              <span
                className={`${isActive ? "text-gray-900" : "text-gray-400"}`}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
