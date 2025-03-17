import {
  Clock,
  CheckCircle2,
  Ruler,
  PackageCheck,
  CheckSquare,
  Package,
  AlertTriangle,
  XSquare,
  AlertCircle,
  Flag,
  Loader2,
  Ban,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";

// Job Order Statuses
export const JOB_ORDER_STATUSES = {
  PENDING: {
    value: "Pending",
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    description: "Request is awaiting approval",
  },
  APPROVED: {
    value: "Approved",
    label: "Approved",
    icon: CheckCircle2,
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    description: "Request has been approved",
  },
  MEASURED: {
    value: "Measured",
    label: "Measured",
    icon: Ruler,
    color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    description: "Measurements have been taken",
  },
  FOR_CLAIMING: {
    value: "For Claiming",
    label: "For Claiming",
    icon: PackageCheck,
    color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    description: "Ready for claiming",
  },
  COMPLETED: {
    value: "Completed",
    label: "Completed",
    icon: CheckSquare,
    color: "bg-green-100 text-green-800 hover:bg-green-200",
    description: "Job order has been completed",
  },
  REJECTED: {
    value: "Rejected",
    label: "Rejected",
    icon: AlertCircle,
    color:
      "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50",
    description: "Order has been rejected",
  },
};

// Inventory Statuses
export const INVENTORY_STATUSES = {
  IN_STOCK: {
    value: "In Stock",
    label: "In Stock",
    icon: Package,
    color: "bg-green-100 text-green-800 hover:bg-green-200",
    description: "Item is available in stock",
  },
  LOW_STOCK: {
    value: "Low Stock",
    label: "Low Stock",
    icon: AlertTriangle,
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    description: "Item is running low on stock",
  },
  OUT_OF_STOCK: {
    value: "Out of Stock",
    label: "Out of Stock",
    icon: XSquare,
    color: "bg-red-100 text-red-800 hover:bg-red-200",
    description: "Item is out of stock",
  },
};

// Priority Levels
export const PRIORITY_STATUSES = {
  HIGH: {
    value: "High",
    label: "High Priority",
    icon: ShieldAlert,
    color: "bg-red-100 text-red-800 hover:bg-red-200",
    description: "Requires immediate attention",
  },
  MEDIUM: {
    value: "Medium",
    label: "Medium Priority",
    icon: ShieldQuestion,
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    description: "Standard priority level",
  },
  LOW: {
    value: "Low",
    label: "Low Priority",
    icon: ShieldCheck,
    color: "bg-green-100 text-green-800 hover:bg-green-200",
    description: "Can be handled when resources are available",
  },
};

// Request Statuses
export const REQUEST_STATUSES = {
  PENDING: {
    value: "Pending",
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    description: "Request is being reviewed",
  },
  IN_PROGRESS: {
    value: "In Progress",
    label: "In Progress",
    icon: Loader2,
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    description: "Request is being processed",
  },
  COMPLETED: {
    value: "Completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 hover:bg-green-200",
    description: "Request has been fulfilled",
  },
  CANCELLED: {
    value: "Cancelled",
    label: "Cancelled",
    icon: Ban,
    color: "bg-red-100 text-red-800 hover:bg-red-200",
    description: "Request has been cancelled",
  },
};

// Helper functions to get arrays of statuses
export const getJobOrderStatusArray = () => Object.values(JOB_ORDER_STATUSES);
export const getInventoryStatusArray = () => Object.values(INVENTORY_STATUSES);
export const getPriorityStatusArray = () => Object.values(PRIORITY_STATUSES);
export const getRequestStatusArray = () => Object.values(REQUEST_STATUSES);

// Helper functions to get status configs
export const getJobOrderStatusConfig = (statusValue) => {
  return (
    Object.values(JOB_ORDER_STATUSES).find(
      (status) => status.value === statusValue
    ) || JOB_ORDER_STATUSES.PENDING
  );
};

export const getInventoryStatusConfig = (statusValue) => {
  return (
    Object.values(INVENTORY_STATUSES).find(
      (status) => status.value === statusValue
    ) || INVENTORY_STATUSES.OUT_OF_STOCK
  );
};

export const getPriorityStatusConfig = (statusValue) => {
  return (
    Object.values(PRIORITY_STATUSES).find(
      (status) => status.value === statusValue
    ) || PRIORITY_STATUSES.MEDIUM
  );
};

export const getRequestStatusConfig = (statusValue) => {
  return (
    Object.values(REQUEST_STATUSES).find(
      (status) => status.value === statusValue
    ) || REQUEST_STATUSES.PENDING
  );
};

// Helper function to render status badge
export const renderStatusBadge = (status, config) => {
  const statusConfig = config(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center gap-1">
      <StatusIcon className="h-3.5 w-3.5" />
      <span>{statusConfig.label}</span>
    </div>
  );
};
