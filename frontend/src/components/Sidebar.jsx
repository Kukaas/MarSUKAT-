import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuItems } from "../config/menuItems";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { ChevronRight } from "lucide-react";

export default function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || "Student";
  const userId = user?._id;

  const currentMenuItems = menuItems[role] || [];

  const getCurrentPath = (pathFn) => {
    if (
      role === "Student" ||
      role === "SuperAdmin" ||
      role === "CommercialJob" ||
      role === "Coordinator" ||
      role === "JobOrder"
    ) {
      return pathFn(userId);
    }
    return pathFn();
  };

  const renderMenuItem = (item) => {
    if (item.type === "accordion") {
      return (
        <Accordion
          type="single"
          collapsible
          className="w-full"
          key={item.title}
        >
          <AccordionItem value={item.title} className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg text-sm hover:bg-gray-50/50 hover:no-underline p-0">
              <div className="flex items-center gap-3 px-4 py-2.5 w-full">
                <span className="text-gray-400">{item.icon}</span>
                <span className="font-medium">{item.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {item.items.map((subItem) => {
                const isActive =
                  location.pathname === getCurrentPath(subItem.path);
                return (
                  <Link
                    key={subItem.title}
                    to={getCurrentPath(subItem.path)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ml-4 ${
                      isActive
                        ? "bg-gray-50 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-900"
                    }`}
                  >
                    <span
                      className={`${
                        isActive ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {subItem.icon}
                    </span>
                    <span className="font-medium">{subItem.title}</span>
                  </Link>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    const isActive = location.pathname === getCurrentPath(item.path);
    return (
      <Link
        key={item.title}
        to={getCurrentPath(item.path)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? "bg-gray-50 text-gray-900"
            : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-900"
        }`}
      >
        <span className={`${isActive ? "text-gray-900" : "text-gray-400"}`}>
          {item.icon}
        </span>
        <span className="font-medium">{item.title}</span>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex h-full flex-col bg-white border-r border-gray-100">
      <nav className="flex-1 px-3 pt-6 space-y-1">
        {currentMenuItems.map((item) => renderMenuItem(item))}
      </nav>
    </div>
  );
}
