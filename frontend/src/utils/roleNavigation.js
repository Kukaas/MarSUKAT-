// Helper function to get dashboard path based on role and userId
export const getDashboardPath = (role, userId) => {
  const roleLower = role?.toLowerCase();
  
  // If no userId is provided, return the base dashboard path
  const id = userId || '';
  
  switch (roleLower) {
    case "student":
      return `/student/dashboard/${id}`;
    case "bao":
      return `/bao/dashboard/${id}`;
    case "joborder":
      return `/job-order/dashboard/${id}`;
    case "staff":
      return "/staff/dashboard";
    case "superadmin":
      return `/superadmin/dashboard/${id}`;
    case "coordinator":
      return `/coordinator/dashboard/${id}`;
    default:
      return "/login";
  }
};

// Role path prefix mapping
export const rolePathMap = {
  student: "/student",
  bao: "/bao",
  joborder: "/job-order",
  staff: "/staff",
  superadmin: "/superadmin",
  coordinator: "/coordinator",
};

// Navigate to role-specific dashboard
export const navigateToRoleDashboard = (navigate, user) => {
  if (!user?.role) return navigate("/login", { replace: true });
  const userId = user._id || user.id; // Try both common ID property names
  const path = getDashboardPath(user.role, userId);
  navigate(path, { replace: true });
};
