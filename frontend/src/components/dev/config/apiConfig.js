// Define available routes categorized
export const ROUTES = {
  Development: {
    routes: [
      { path: "/dev/available-users", method: "GET" },
      { path: "/dev/switch-user", method: "POST", body: true },
    ],
  },
  Users: {
    routes: [
      // User routes
      { path: "/users", method: "GET" },
      { path: "/users/:id", method: "GET" },
      { path: "/users/register", method: "POST", body: true },
      { path: "/users/login", method: "POST", body: true },
      { path: "/users/:id", method: "DELETE" },
      // Job Order routes
      { path: "/users/job-orders", method: "GET" },
      { path: "/users/job-orders/:id", method: "GET" },
      { path: "/users/job-orders", method: "POST", body: true },
      { path: "/users/job-orders/:id", method: "DELETE" },
    ],
  },
  "Raw Materials": {
    routes: [
      // Raw Material Inventory (JobOrder role required)
      { path: "/raw-material-inventory", method: "GET", role: "JobOrder" },
      { path: "/raw-material-inventory/:id", method: "GET", role: "JobOrder" },
      {
        path: "/raw-material-inventory/category/:category",
        method: "GET",
        role: "JobOrder",
      },
      {
        path: "/raw-material-inventory",
        method: "POST",
        body: true,
        role: "JobOrder",
      },
      {
        path: "/raw-material-inventory/:id",
        method: "DELETE",
        role: "JobOrder",
      },
    ],
  },
  "Product Management": {
    routes: [
      // Product Types
      { path: "/product-types", method: "GET" },
      { path: "/product-types/:id", method: "GET" },
      {
        path: "/product-types",
        method: "POST",
        body: true,
        role: "SuperAdmin",
      },
      { path: "/product-types/:id", method: "DELETE", role: "SuperAdmin" },
      // Prices
      { path: "/prices", method: "GET" },
      { path: "/prices/:id", method: "GET" },
      { path: "/prices", method: "POST", body: true, role: "SuperAdmin" },
      { path: "/prices/:id", method: "DELETE", role: "SuperAdmin" },
    ],
  },
  "System Maintenance": {
    routes: [
      // Levels
      { path: "/levels", method: "GET" },
      { path: "/levels/:id", method: "GET" },
      { path: "/levels", method: "POST", body: true, role: "SuperAdmin" },
      { path: "/levels/:id", method: "DELETE", role: "SuperAdmin" },
      // Department Levels
      { path: "/department-levels", method: "GET" },
      { path: "/department-levels/active", method: "GET" },
      { path: "/department-levels", method: "POST", body: true },
      { path: "/department-levels/:id", method: "DELETE" },
      // Categories (SuperAdmin only for mutations)
      { path: "/categories", method: "GET" },
      { path: "/categories/:id", method: "GET" },
      { path: "/categories", method: "POST", body: true, role: "SuperAdmin" },
      { path: "/categories/:id", method: "DELETE", role: "SuperAdmin" },
    ],
  },
};

// Helper function to generate unique data
const generateUniqueData = (prefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// Define default request bodies for POST/PUT endpoints with dynamic data
export const DEFAULT_BODIES = {
  "/users/register": () => ({
    name: generateUniqueData("User"),
    email: `user.${Date.now()}@example.com`,
    password: `password${Math.random().toString(36).slice(2)}`,
    role: "Student",
    studentNumber: `2024-${Math.floor(10000 + Math.random() * 90000)}`,
    studentGender: ["Male", "Female"][Math.floor(Math.random() * 2)],
    department: ["IT", "CS", "IS"][Math.floor(Math.random() * 3)],
    level: ["First Year", "Second Year", "Third Year", "Fourth Year"][
      Math.floor(Math.random() * 4)
    ],
  }),

  "/users/login": () => ({
    email: `user.${Date.now()}@example.com`,
    password: `password${Math.random().toString(36).slice(2)}`,
  }),

  "/users/job-orders": () => ({
    name: generateUniqueData("JobOrder"),
    email: `joborder.${Date.now()}@example.com`,
    password: `password${Math.random().toString(36).slice(2)}`,
    role: "JobOrder",
    gender: ["Male", "Female"][Math.floor(Math.random() * 2)],
    jobType: ["Tailor", "Seamstress", "Pattern Maker"][
      Math.floor(Math.random() * 3)
    ],
    jobDescription: [
      "Experienced in formal wear",
      "Specializes in uniforms",
      "Expert in alterations",
      "Custom design specialist",
    ][Math.floor(Math.random() * 4)],
    isActive: true,
  }),

  "/raw-material-inventory": () => ({
    category: ["Fabric", "Thread", "Button", "Zipper"][
      Math.floor(Math.random() * 4)
    ],
    rawMaterialType: ["Cotton", "Polyester", "Silk", "Denim"][
      Math.floor(Math.random() * 4)
    ],
    unit: ["meters", "pieces", "rolls", "yards"][Math.floor(Math.random() * 4)],
    quantity: Number((Math.random() * 1000).toFixed(2)),
    status: ["Available", "Low Stock", "Out of Stock"][
      Math.floor(Math.random() * 3)
    ],
    image: {
      filename: `material-${Date.now()}`,
      contentType: "image/jpeg",
      data: "",
    },
  }),

  "/product-types": () => ({
    level: ["First Year", "Second Year", "Third Year", "Fourth Year"][
      Math.floor(Math.random() * 4)
    ],
    productType: [
      "PE Uniform",
      "School Uniform",
      "Laboratory Gown",
      "Department Shirt",
    ][Math.floor(Math.random() * 4)],
    size: ["Small", "Medium", "Large", "XL"][Math.floor(Math.random() * 4)],
    price: Number((Math.random() * 1000 + 500).toFixed(2)),
    rawMaterialsUsed: [
      {
        category: ["Fabric", "Thread", "Button"][Math.floor(Math.random() * 3)],
        type: ["Cotton", "Polyester", "Silk", "Denim"][
          Math.floor(Math.random() * 4)
        ],
        quantity: Number((Math.random() * 5 + 1).toFixed(2)),
        unit: ["meters", "pieces", "rolls"][Math.floor(Math.random() * 3)],
      },
    ],
  }),

  "/prices": () => ({
    price: Number((Math.random() * 1000 + 500).toFixed(2)),
  }),

  "/levels": () => ({
    level: ["First Year", "Second Year", "Third Year", "Fourth Year"][
      Math.floor(Math.random() * 4)
    ],
    description: `Level for ${
      ["undergraduate", "graduate", "postgraduate"][
        Math.floor(Math.random() * 3)
      ]
    } students`,
  }),

  "/department-levels": () => ({
    department: [
      "Information Technology",
      "Computer Science",
      "Information Systems",
    ][Math.floor(Math.random() * 3)],
    level: ["First Year", "Second Year", "Third Year", "Fourth Year"][
      Math.floor(Math.random() * 4)
    ],
    isActive: Math.random() > 0.2, // 80% chance of being active
  }),

  "/categories": () => ({
    name: ["Uniforms", "Laboratory Wear", "Department Attire", "Accessories"][
      Math.floor(Math.random() * 4)
    ],
    description: `Category for ${
      ["student wear", "faculty wear", "special events"][
        Math.floor(Math.random() * 3)
      ]
    }`,
    type: ["Product", "Material"][Math.floor(Math.random() * 2)],
    status: ["Active", "Inactive"][Math.floor(Math.random() * 2)],
  }),
};
