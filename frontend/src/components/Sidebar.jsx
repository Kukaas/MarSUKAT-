import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuItems } from "../config/menuItems";
import { ScrollArea } from "./ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || "Student";
  const userId = user?._id;
  const [openAccordion, setOpenAccordion] = useState(null);

  const currentMenuItems = menuItems[role] || [];

  // Update open accordion when path changes
  useEffect(() => {
    const currentPath = location.pathname;
    currentMenuItems.forEach((item) => {
      if (item.type === "accordion") {
        const hasActiveChild = item.items.some(
          (subItem) => currentPath === getCurrentPath(subItem.path)
        );
        if (hasActiveChild) {
          setOpenAccordion(item.title);
        }
      }
    });
  }, [location.pathname]);

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
          value={openAccordion}
          onValueChange={setOpenAccordion}
          className="w-full"
          key={item.title}
        >
          <AccordionItem value={item.title} className="border-none">
            <AccordionTrigger
              className={`flex items-center gap-1.5 rounded-lg text-sm hover:bg-gray-50/50 hover:no-underline p-0 data-[state=open]:bg-gray-50 data-[state=open]:text-gray-900`}
            >
              <div className="flex items-center gap-2.5 px-2 py-1.5 w-full">
                <span
                  className={`h-4 w-4 flex items-center justify-center ${
                    openAccordion === item.title
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`font-medium leading-none ${
                    openAccordion === item.title
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {item.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0.5">
              {item.items.map((subItem) => {
                const isActive =
                  location.pathname === getCurrentPath(subItem.path);
                return (
                  <Link
                    key={subItem.title}
                    to={getCurrentPath(subItem.path)}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ml-3 ${
                      isActive
                        ? "bg-gray-50 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-900"
                    }`}
                  >
                    <span
                      className={`${
                        isActive ? "text-gray-900" : "text-gray-400"
                      } h-4 w-4 flex items-center justify-center`}
                    >
                      {subItem.icon}
                    </span>
                    <span className="font-medium leading-none">
                      {subItem.title}
                    </span>
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
        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
          isActive
            ? "bg-gray-50 text-gray-900"
            : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-900"
        }`}
      >
        <span
          className={`${
            isActive ? "text-gray-900" : "text-gray-400"
          } h-4 w-4 flex items-center justify-center`}
        >
          {item.icon}
        </span>
        <span className="font-medium leading-none">{item.title}</span>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex h-full flex-col bg-white border-r border-gray-100">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="px-3 pt-6 space-y-1">
          {currentMenuItems.map((item) => renderMenuItem(item))}
        </div>
      </ScrollArea>
    </div>
  );
}
