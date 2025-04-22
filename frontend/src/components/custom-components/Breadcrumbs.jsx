import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { getTitleFromPath } from "@/utils/getTitleFromPath";

const Breadcrumbs = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Don't show breadcrumbs on home page
  if (location.pathname === "/") return null;

  // Split the path into segments
  const segments = location.pathname
    .split('/')
    .filter((segment) => segment !== '');
  
  // Generate breadcrumb items and their paths
  const breadcrumbItems = [];
  
  // Add Home link as first item
  breadcrumbItems.push({
    path: "/",
    label: "Home",
    isHome: true,
  });
  
  // Match the first segment to a role
  const firstSegment = segments[0];
  if (["superadmin", "bao", "job-order", "student", "coordinator"].includes(firstSegment)) {
    // Get user ID for dashboard links
    const userId = user?._id || '';
    const dashboardPath = `/${firstSegment}/dashboard${userId ? `/${userId}` : ''}`;
    const roleLabel = firstSegment === "job-order" ? "Job Order" : 
                      firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
    
    // Add the role dashboard as second item
    breadcrumbItems.push({
      path: dashboardPath,
      label: `${roleLabel} Dashboard`,
    });
    
    // Skip accordion items in the breadcrumbs
    // Use the current path's full title for the final breadcrumb
    if (segments.length > 1) {
      // Get title for the current path
      const fullPathTitle = getTitleFromPath(location.pathname).split(" | ")[0];
      
      // If we have a valid title that's not "MarSUKAT", add it as the final breadcrumb
      if (fullPathTitle && fullPathTitle !== "MarSUKAT") {
        // Skip adding if it's the dashboard (already added above)
        if (!fullPathTitle.includes("Dashboard")) {
          breadcrumbItems.push({
            path: location.pathname,
            label: fullPathTitle,
          });
        }
      }
    }
  } else {
    // For public pages
    let currentPath = '';
    segments.forEach((segment) => {
      // Skip ID parameters
      if (!isNaN(segment) || 
          (segment.length === 24 && /^[0-9a-f]{24}$/i.test(segment))) {
        return;
      }
      
      currentPath += `/${segment}`;
      const pathTitle = getTitleFromPath(currentPath).split(" | ")[0];
      
      const label = pathTitle !== "MarSUKAT" 
        ? pathTitle 
        : segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      breadcrumbItems.push({
        path: currentPath,
        label: label,
      });
    });
  }
  
  // Set the last item to be the current page (not clickable)
  if (breadcrumbItems.length > 1) {
    breadcrumbItems[breadcrumbItems.length - 1].isLast = true;
  }
  
  // Don't show breadcrumbs if we only have home
  if (breadcrumbItems.length <= 1) return null;
  
  return (
    <div className="mb-6 overflow-x-auto scrollbar-none">
      <Breadcrumb className="whitespace-nowrap">
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => {
            // Ensure string values for key, path and label
            const itemKey = typeof item.path === 'string' ? item.path : `bread-${index}`;
            const itemPath = typeof item.path === 'string' ? item.path : '#';
            const itemLabel = typeof item.label === 'string' ? item.label : 'Navigation';
            
            return (
              <React.Fragment key={itemKey}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-xs">
                      {itemLabel}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={itemPath} className="flex items-center gap-2">
                        {item.isHome && <Home className="h-3.5 w-3.5 flex-shrink-0" />}
                        <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-xs">
                          {itemLabel}
                        </span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
