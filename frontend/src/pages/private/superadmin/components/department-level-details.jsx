import { formatDate, cn } from "@/lib/utils";
import {
  Building2,
  Calendar,
  GraduationCap,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DetailItem = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  </div>
);

export function DepartmentLevelDetails({ departmentLevel }) {
  const StatusIcon = departmentLevel?.isActive ? CheckCircle2 : XCircle;
  const statusColorMap = {
    Active: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Inactive: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="flex flex-col h-full divide-y">
      {/* Header Information */}
      <div className="pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              Department Level ID
            </div>
            <div className="font-semibold text-lg">
              {departmentLevel?.departmentLevelId || "-"}
            </div>
          </div>
          <Badge
            className={cn(
              "flex items-center gap-1",
              statusColorMap[departmentLevel?.isActive ? "Active" : "Inactive"]
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {departmentLevel?.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="py-6 flex-1">
        <h3 className="font-semibold mb-4">Details</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={Building2}
            label="Department"
            value={departmentLevel?.department || "-"}
          />
          <DetailItem
            icon={GraduationCap}
            label="Level"
            value={departmentLevel?.level || "-"}
          />
          <DetailItem
            icon={Calendar}
            label="Created At"
            value={formatDate(departmentLevel?.createdAt, "long")}
          />
        </div>
      </div>
    </div>
  );
}
