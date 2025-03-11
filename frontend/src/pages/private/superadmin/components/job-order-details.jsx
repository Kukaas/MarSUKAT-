import * as React from "react";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Ban,
  Edit2,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  getJobOrderStatusConfig,
  getPriorityStatusConfig,
} from "@/config/statuses";

const DetailItem = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  </div>
);

const JobOrderContent = ({ data, onEdit, onApprove, onReject }) => {
  const statusConfig = getJobOrderStatusConfig(data.status);
  const priorityConfig = getPriorityStatusConfig(data.priority);
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;

  // Status color mapping
  const statusColorMap = {
    Pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
    Approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
    Completed: "bg-blue-50 text-blue-600 border-blue-200",
    "For Claiming": "bg-purple-50 text-purple-600 border-purple-200",
  };

  // Priority color mapping
  const priorityColorMap = {
    High: "bg-red-50 text-red-600 border-red-200",
    Medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
    Low: "bg-blue-50 text-blue-600 border-blue-200",
  };

  return (
    <div className="flex flex-col h-full divide-y">
      {/* Header Information */}
      <div className="pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Job Order ID</div>
            <div className="font-semibold text-lg">{data.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "flex items-center gap-1",
                statusColorMap[data.status]
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
            <Badge
              className={cn(
                "flex items-center gap-1",
                priorityColorMap[data.priority]
              )}
            >
              <PriorityIcon className="h-3 w-3" />
              {priorityConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="py-6 flex-1">
        <h3 className="font-semibold mb-4">Request Details</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={User}
            label="Requested By"
            value={data.requestedBy}
          />
          <DetailItem
            icon={Building2}
            label="Department"
            value={data.department}
          />
          <DetailItem
            icon={Calendar}
            label="Date Requested"
            value={format(new Date(data.dateRequested), "MMMM d, yyyy")}
          />
          <DetailItem
            icon={Clock}
            label="Time"
            value={format(new Date(data.dateRequested), "hh:mm a")}
          />
        </div>
      </div>

      {/* Description */}
      <div className="pt-6 flex-1">
        <h3 className="font-semibold mb-4">Description</h3>
        <div className="bg-muted/5 rounded-lg p-4 h-[calc(100%-2rem)]">
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>
      </div>
    </div>
  );
};

const JobOrderDetailsDialog = ({
  isOpen,
  onClose,
  data,
  onEdit,
  onApprove,
  onReject,
}) => {
  if (!data) return null;

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title="Job Order Details"
    >
      <JobOrderContent
        data={data}
        onEdit={() => onEdit(data)}
        onApprove={() => onApprove(data)}
        onReject={() => onReject(data)}
      />
    </ViewDetailsDialog>
  );
};

export { DetailItem, JobOrderDetailsDialog };
