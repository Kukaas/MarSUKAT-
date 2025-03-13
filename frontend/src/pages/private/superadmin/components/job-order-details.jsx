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
  Mail,
  Users,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  getJobOrderStatusConfig,
  getPriorityStatusConfig,
} from "@/config/statuses";

const DetailItem = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-start gap-2", className)}>
    <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
    <div className="min-w-0 space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">
        {React.isValidElement(value) ? value : String(value || "-")}
      </div>
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
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-base font-semibold mb-4">Basic Information</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem icon={User} label="Name" value={data.name || "-"} />
          <DetailItem icon={Mail} label="Email" value={data.email || "-"} />
          <DetailItem icon={Users} label="Gender" value={data.gender || "-"} />
          <DetailItem
            icon={Briefcase}
            label="Job Type"
            value={data.jobType || "-"}
          />
          <DetailItem
            icon={Calendar}
            label="Created At"
            value={format(new Date(data.createdAt), "PPP")}
          />
          <DetailItem
            icon={FileText}
            label="Status"
            value={
              <Badge
                className={cn(
                  "px-2 py-1",
                  data.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {data.isActive ? "Active" : "Inactive"}
              </Badge>
            }
          />
        </div>
      </div>

      {/* Job Description */}
      <div>
        <h3 className="text-base font-semibold mb-4">Job Description</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {data.jobDescription || "No description provided"}
          </p>
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
        onEdit={onEdit}
        onApprove={onApprove}
        onReject={onReject}
      />
    </ViewDetailsDialog>
  );
};

export { DetailItem, JobOrderDetailsDialog };
