import { formatDate, cn } from "@/lib/utils";
import {
  Building2,
  Calendar,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";

const InfoCard = ({ icon: Icon, label, value, className }) => (
  <Card
    className={cn(
      "group border-border/50 shadow-sm",
      "bg-card hover:bg-accent transition-colors duration-200",
      "dark:bg-card/95 dark:hover:bg-accent/90",
      className
    )}
  >
    <CardContent className="flex items-start p-3 sm:p-4 gap-3 sm:gap-4">
      <div className="rounded-full bg-primary/10 p-2 sm:p-2.5 ring-1 ring-border/50 shrink-0 dark:bg-primary/20 group-hover:ring-primary/50 transition-all duration-200">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-medium break-words text-foreground">
          {value || "Not specified"}
        </p>
      </div>
    </CardContent>
  </Card>
);

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="h-5 sm:h-6 w-1 rounded-full bg-gradient-to-b from-primary/80 to-primary/50" />
    <h3 className="text-base sm:text-lg font-semibold text-foreground">
      {children}
    </h3>
  </div>
);

function DepartmentLevelContent({ departmentLevel }) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Department Level Info */}
        <div className="relative">
          <div className="absolute inset-0 h-32 sm:h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4 ring-4 ring-background shadow-xl">
              <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center pb-3 sm:pb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                {departmentLevel?.department || "-"}
              </h3>
              <div className="flex flex-col items-center gap-2">
                <StatusBadge
                  status={departmentLevel?.departmentLevelId || "Unknown"}
                  icon={Info}
                  className="text-xs sm:text-sm"
                />
                <StatusBadge
                  status={departmentLevel?.isActive ? "Active" : "Inactive"}
                  icon={departmentLevel?.isActive ? CheckCircle2 : XCircle}
                  variant={
                    departmentLevel?.isActive ? "success" : "destructive"
                  }
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Department Level Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Details</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard
              icon={GraduationCap}
              label="Level"
              value={departmentLevel?.level || "-"}
            />
            <InfoCard
              icon={Calendar}
              label="Created At"
              value={formatDate(departmentLevel?.createdAt, "long")}
            />
            <InfoCard
              icon={Calendar}
              label="Updated At"
              value={
                formatDate(departmentLevel?.updatedAt, "long") ||
                "Not updated yet"
              }
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

const DepartmentLevelDetailsDialog = ({ isOpen, onClose, departmentLevel }) => {
  if (!departmentLevel) return null;

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title="Department Level Details"
    >
      <DepartmentLevelContent departmentLevel={departmentLevel} />
    </ViewDetailsDialog>
  );
};

// Add DepartmentLevelDetails export for backward compatibility
const DepartmentLevelDetails = ({ departmentLevel }) => (
  <DepartmentLevelContent departmentLevel={departmentLevel} />
);

export { DepartmentLevelDetailsDialog, DepartmentLevelDetails };
