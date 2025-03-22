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
      role === "JobOrder" ||
      role === "BAO"
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
              className={`group flex items-center gap-1.5 rounded-lg text-sm transition-all duration-200 ease-in-out
                hover:bg-muted/80 dark:hover:bg-muted/20 hover:no-underline p-0 
                data-[state=open]:bg-muted/80 dark:data-[state=open]:bg-muted/20 data-[state=open]:text-foreground`}
            >
              <div className="flex items-center gap-3 px-3 py-2.5 w-full">
                <span
                  className={`h-5 w-5 flex items-center justify-center transition-colors duration-200
                    ${
                      openAccordion === item.title
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`font-medium leading-none transition-colors duration-200
                    ${
                      openAccordion === item.title
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                >
                  {item.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-1">
              {item.items.map((subItem) => {
                const isActive =
                  location.pathname === getCurrentPath(subItem.path);
                return (
                  <Link
                    key={subItem.title}
                    to={getCurrentPath(subItem.path)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out ml-4
                      ${
                        isActive
                          ? "bg-muted/80 dark:bg-muted/20 text-foreground"
                          : "text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted/20 hover:text-foreground"
                      }`}
                  >
                    <span
                      className={`h-5 w-5 flex items-center justify-center transition-colors duration-200
                        ${
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
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
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out
          ${
            isActive
              ? "bg-muted/80 dark:bg-muted/20 text-foreground"
              : "text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted/20 hover:text-foreground"
          }`}
      >
        <span
          className={`h-5 w-5 flex items-center justify-center transition-colors duration-200
            ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground"
            }`}
        >
          {item.icon}
        </span>
        <span className="font-medium leading-none">{item.title}</span>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex h-full flex-col bg-background border-r border-border">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="px-3 py-6 space-y-1.5">
          {currentMenuItems.map((item) => renderMenuItem(item))}
        </div>
      </ScrollArea>
    </div>
  );
}
