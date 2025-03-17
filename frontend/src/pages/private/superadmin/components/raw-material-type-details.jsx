import { formatDate, cn } from "@/lib/utils";
import { Box, Calendar, FileText, Tag, Ruler, Info } from "lucide-react";
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

function RawMaterialTypeContent({ type }) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Type Info */}
        <div className="relative">
          <div className="absolute inset-0 h-32 sm:h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4 ring-4 ring-background shadow-xl">
              <Box className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center pb-3 sm:pb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                {type?.name || "-"}
              </h3>
              <StatusBadge
                status={type?.typeId || "Unknown"}
                icon={Info}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Basic Information</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard icon={FileText} label="Name" value={type?.name || "-"} />
            <InfoCard
              icon={Tag}
              label="Category"
              value={type?.category || "-"}
            />
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Specifications</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1">
            <InfoCard
              icon={FileText}
              label="Description"
              value={type?.description || "-"}
            />
            <InfoCard
              icon={Ruler}
              label="Unit of Measurement"
              value={type?.unit || "-"}
            />
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>History</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard
              icon={Calendar}
              label="Created At"
              value={formatDate(type?.createdAt, "long")}
            />
            <InfoCard
              icon={Calendar}
              label="Updated At"
              value={formatDate(type?.updatedAt, "long") || "Not updated yet"}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

const RawMaterialTypeDetailsDialog = ({ isOpen, onClose, type }) => {
  if (!type) return null;

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title="Raw Material Type Details"
    >
      <RawMaterialTypeContent type={type} />
    </ViewDetailsDialog>
  );
};

// Add RawMaterialTypeDetails export for backward compatibility
const RawMaterialTypeDetails = ({ type }) => (
  <RawMaterialTypeContent type={type} />
);

export { RawMaterialTypeDetailsDialog, RawMaterialTypeDetails };
