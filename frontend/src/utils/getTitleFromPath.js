import { menuItems } from "../config/menuItems";

// Map of all routes that need titles
const routeTitles = {
  // Public menu routes
  "/": "Home",
  "/about": "About",
  "/contact-us": "Contact Us",
  "/faq": "FAQ",

  // Auth routes
  "/login": "Login",
  "/signup": "Sign Up",
  "/create-super-admin": "Create Super Admin",
  "/verification-success": "Verification Success",
  "/verification-error": "Verification Error",
  "/forgot-password": "Forgot Password",
  "/verify-otp": "Verify OTP",
};

// Role-based route patterns
const roleBasedRoutes = {
  student: {
    dashboard: "Student Dashboard",
    orders: "Student Orders",
    schedules: "Student Schedules",
  },
  "job-order": {
    dashboard: "Job Order Dashboard",
    "student-orders": "Student Orders Management",
    "commercial-orders": "Commercial Orders",
    rentals: "Rentals Management",
    schedules: "Schedules Management",
    "uniform-production": "Uniform Production",
    "academic-gowns-production": "Academic Gowns Production",
    "commercial-job-production": "Commercial Job Production",
    "other-productions": "Other Productions",
  },
  superadmin: {
    dashboard: "Super Admin Dashboard",
    "create-job-order": "Create Job Order",
    maintenance: {
      levels: "Levels Management",
      departments: "Departments Management",
      "department-levels": "Department Levels Management",
      units: "Units Management",
      categories: "Categories Management",
      sizes: "Sizes Management",
      prices: "Prices Management",
      "raw-material-types": "Raw Material Types",
      "product-types": "Product Types",
    },
  },
  bao: {
    dashboard: "BAO Dashboard",
    "productions": "Productions Management",
    "inventory": "Inventory Management",
    "reports": "Reports",
    "sales": "Sales Management",
    "accomplishments": "Accomplishments Management",
  },
  coordinator: {
    dashboard: "Coordinator Dashboard",
    "rental-request": "Rental Request",
  },
  // Extra mappings for breadcrumbs
  general: {
    "maintenance": "Maintenance",
    "inventory": "Inventory",
    "productions": "Productions",
    "reports": "Reports",
  }
};

// Helper function to remove parameter segments from path
const removeParamsFromPath = (path) => {
  return path.replace(/\/:[^/]+/g, ''); // Remove parameter segments like /:userId
};

// Helper function to normalize paths for comparison
const normalizePath = (path) => {
  path = removeParamsFromPath(path);
  path = path.replace(/\/$/, "");
  return path.replace(/\/[0-9]+(?=\/|$)/g, "");
};

// Helper function to get role-based title
const getRoleBasedTitle = (normalizedPath) => {
  const parts = normalizedPath.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const role = parts[0];
  const section = parts[1];
  const subsection = parts[2];

  if (roleBasedRoutes[role]) {
    if (subsection && roleBasedRoutes[role][section]?.[subsection]) {
      return roleBasedRoutes[role][section][subsection];
    }
    if (roleBasedRoutes[role][section]) {
      return roleBasedRoutes[role][section];
    }
  }

  return null;
};

export const getTitleFromPath = (pathname) => {
  // Default title
  let title = "MarSUKAT";

  // Normalize the current pathname
  const normalizedPath = normalizePath(pathname);

  // First check exact matches in routeTitles
  if (routeTitles[normalizedPath]) {
    return `${routeTitles[normalizedPath]} | MarSUKAT`;
  }

  // Then check for routes that start with the pathname
  const matchingRoute = Object.entries(routeTitles).find(
    ([route]) => normalizedPath.startsWith(route) && route !== "/" // Exclude root path from partial matches
  );
  if (matchingRoute) {
    return `${matchingRoute[1]} | MarSUKAT`;
  }

  // Check for role-based routes
  const roleBasedTitle = getRoleBasedTitle(normalizedPath);
  if (roleBasedTitle) {
    return `${roleBasedTitle} | MarSUKAT`;
  }

  // Helper function to search in menu items
  const findTitle = (items) => {
    for (const item of items) {
      if (typeof item.path === "function") {
        // Get the base path without parameters
        const basePath = item.path().split("/:")[0];
        // Compare normalized paths
        if (
          normalizedPath.startsWith(basePath) ||
          normalizedPath === basePath
        ) {
          return item.title;
        }
      }

      // Check accordion items
      if (item.type === "accordion" && item.items) {
        const subTitle = findTitle(item.items);
        if (subTitle) return subTitle;
      }
    }
    return null;
  };

  // Search in all menu categories
  Object.entries(menuItems).forEach(([category, items]) => {
    const foundTitle = findTitle(items);
    if (foundTitle) {
      title = `${foundTitle} | MarSUKAT`;
    }
  });

  return title;
};

// Helper function for breadcrumbs to get just the page title without the suffix
export const getPageTitleOnly = (pathname) => {
  const fullTitle = getTitleFromPath(pathname);
  return fullTitle.split(" | ")[0];
};
