import { formatDate, cn } from "@/lib/utils";
import { GraduationCap, Calendar, FileText, Info } from "lucide-react";

const DetailItem = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  </div>
);

export function LevelDetails({ level }) {
  return (
    <div className="flex flex-col h-full divide-y">
      {/* Header Information */}
      <div className="pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Level ID</div>
            <div className="font-semibold text-lg">{level?.levelId || "-"}</div>
          </div>
        </div>
      </div>

      {/* Level Details */}
      <div className="py-6 flex-1">
        <h3 className="font-semibold mb-4">Details</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={GraduationCap}
            label="Level"
            value={level?.level || "-"}
          />
          <DetailItem
            icon={Calendar}
            label="Created At"
            value={formatDate(level?.createdAt, "long")}
          />
        </div>
      </div>

      {/* Description */}
      <div className="pt-6 flex-1">
        <h3 className="font-semibold mb-4">Description</h3>
        <div className="bg-muted/5 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            {level?.description || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
