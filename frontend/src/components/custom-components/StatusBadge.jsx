import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StatusBadge - A reusable component for displaying status with appropriate styling
 *
 * @param {Object} props
 * @param {string} props.status - The status text to display
 * @param {Object} props.statusMap - Optional custom mapping of statuses to styles
 * @param {string} props.className - Additional classes to apply
 * @param {React.ReactNode} props.icon - Optional icon to display before status
 * @param {boolean} props.outline - Whether to use outline style (default: true)
 * @param {boolean} props.pill - Whether to use pill shape (default: true)
 */
const StatusBadge = ({
  status,
  statusMap,
  className,
  icon: Icon,
  outline = true,
  pill = true,
  ...props
}) => {
  // Updated status map to match student order statuses
  const defaultStatusMap = {
    // ... keep other existing statuses ...

    // Student Order specific statuses
    Pending: {
      bg: outline ? "bg-transparent" : "bg-yellow-50 dark:bg-yellow-950/30",
      text: "text-yellow-600 dark:text-yellow-400",
      border: "border border-yellow-200 dark:border-yellow-800",
      hoverBg: "hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
    },
    Approved: {
      bg: outline ? "bg-transparent" : "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border border-blue-200 dark:border-blue-800",
      hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    Measured: {
      bg: outline ? "bg-transparent" : "bg-purple-50 dark:bg-purple-950/30",
      text: "text-purple-600 dark:text-purple-400",
      border: "border border-purple-200 dark:border-purple-800",
      hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
    },
    "For Pickup": {
      bg: outline ? "bg-transparent" : "bg-indigo-50 dark:bg-indigo-950/30",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border border-indigo-200 dark:border-indigo-800",
      hoverBg: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    },
    Claimed: {
      bg: outline ? "bg-transparent" : "bg-green-50 dark:bg-green-950/30",
      text: "text-green-600 dark:text-green-400",
      border: "border border-green-200 dark:border-green-800",
      hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/20",
    },
    // Keep other existing statuses...
    Available: {
      bg: outline ? "bg-transparent" : "bg-green-50 dark:bg-green-950/30",
      text: "text-green-600 dark:text-green-400",
      border: "border border-green-200 dark:border-green-800",
      hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/20",
    },
    "Low Stock": {
      bg: outline ? "bg-transparent" : "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "border border-amber-200 dark:border-amber-800",
      hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
    },
    "Out of Stock": {
      bg: outline ? "bg-transparent" : "bg-red-50 dark:bg-red-950/30",
      text: "text-red-600 dark:text-red-400",
      border: "border border-red-200 dark:border-red-800",
      hoverBg: "hover:bg-red-50 dark:hover:bg-red-900/20",
    },
    Active: {
      bg: outline ? "bg-transparent" : "bg-green-50 dark:bg-green-950/30",
      text: "text-green-600 dark:text-green-400",
      border: "border border-green-200 dark:border-green-800",
      hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/20",
    },
    Inactive: {
      bg: outline ? "bg-transparent" : "bg-gray-50 dark:bg-gray-800/30",
      text: "text-gray-600 dark:text-gray-400",
      border: "border border-gray-200 dark:border-gray-700",
      hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-800/50",
    },
    Completed: {
      bg: outline ? "bg-transparent" : "bg-green-50 dark:bg-green-950/30",
      text: "text-green-600 dark:text-green-400",
      border: "border border-green-200 dark:border-green-800",
      hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/20",
    },
    Cancelled: {
      bg: outline ? "bg-transparent" : "bg-red-50 dark:bg-red-950/30",
      text: "text-red-600 dark:text-red-400",
      border: "border border-red-200 dark:border-red-800",
      hoverBg: "hover:bg-red-50 dark:hover:bg-red-900/20",
    },
  };

  // Use provided status map or default
  const styleMap = statusMap || defaultStatusMap;

  // Get styles for current status or use a neutral style if not found
  const style = styleMap[status] || {
    bg: outline ? "bg-transparent" : "bg-gray-50 dark:bg-gray-800/30",
    text: "text-gray-600 dark:text-gray-400",
    border: "border border-gray-200 dark:border-gray-700",
    hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-800/50",
  };

  return (
    <Badge
      className={cn(
        "font-medium capitalize transition-colors",
        style.bg,
        style.text,
        style.border,
        style.hoverBg,
        pill ? "rounded-full px-3" : "rounded",
        Icon ? "pl-2 pr-3" : "px-3",
        className
      )}
      variant="outline"
      {...props}
    >
      {Icon && <Icon className={cn("mr-1 h-3.5 w-3.5 -ml-0.5", style.text)} />}
      {status}
    </Badge>
  );
};

export default StatusBadge;
