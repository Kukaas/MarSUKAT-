// Helper function to get dashboard path based on role and userId
export const getDashboardPath = (role, userId) => {
  const roleLower = role?.toLowerCase();
  switch (roleLower) {
    case "student":
      return `/student/dashboard/${userId}`;
    case "bao":
      return `/bao/dashboard/${userId}`;
    case "joborder":
      return `/job-order/dashboard/${userId}`;
    case "staff":
      return "/staff/dashboard";
    case "superadmin":
      return `/superadmin/dashboard/${userId}`;
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
};

// Navigate to role-specific dashboard
export const navigateToRoleDashboard = (navigate, user) => {
  if (!user?.role) return navigate("/login", { replace: true });
  const path = getDashboardPath(user.role, user._id);
  navigate(path, { replace: true });
};
