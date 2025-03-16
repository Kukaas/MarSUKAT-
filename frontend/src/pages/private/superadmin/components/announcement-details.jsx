import { formatDate, cn } from "@/lib/utils";
import { MessageSquare, Calendar, Bell, Info, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";
import { Badge } from "@/components/ui/badge";

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

const PriorityBadge = ({ priority }) => {
  const styles = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    low: "bg-primary/10 text-primary dark:bg-primary-900/30 dark:text-primary-400",
  };

  const icons = {
    high: <AlertCircle className="h-3 w-3" />,
    medium: <AlertCircle className="h-3 w-3" />,
    low: <Bell className="h-3 w-3" />,
  };

  const labels = {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Low Priority",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full font-medium",
        styles[priority] || styles.low
      )}
    >
      {icons[priority]}
      <span>{labels[priority]}</span>
    </Badge>
  );
};

function AnnouncementContent({ item }) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8 px-6">
        {/* Header with Announcement Info */}
        <div className="relative">
          <div className="absolute inset-0 h-32 sm:h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4 ring-4 ring-background shadow-xl">
              <Bell className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center pb-3 sm:pb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                {item?.title || "-"}
              </h3>
              <div className="flex flex-col gap-2 items-center">
                <StatusBadge
                  status={item?.announcementId || "Unknown"}
                  icon={Info}
                  className="text-xs sm:text-sm"
                />
                <PriorityBadge priority={item?.priority || "low"} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Announcement Content</SectionTitle>
          <Card
            className={cn(
              "bg-muted/50",
              item?.priority === "high" &&
                "border-red-200 bg-red-50/50 dark:bg-red-900/10",
              item?.priority === "medium" &&
                "border-orange-200 bg-orange-50/50 dark:bg-orange-900/10"
            )}
          >
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap text-sm">{item?.content}</p>
            </CardContent>
          </Card>
        </div>

        {/* Priority and Dates */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Details</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <InfoCard
              icon={AlertCircle}
              label="Priority Level"
              value={
                item?.priority
                  ? item.priority.charAt(0).toUpperCase() +
                    item.priority.slice(1)
                  : "Low"
              }
              className={cn(
                item?.priority === "high" &&
                  "border-red-200 bg-red-50/50 dark:bg-red-900/10",
                item?.priority === "medium" &&
                  "border-orange-200 bg-orange-50/50 dark:bg-orange-900/10"
              )}
            />
            <InfoCard
              icon={Calendar}
              label="Start Date"
              value={formatDate(item?.startDate, "long")}
            />
            <InfoCard
              icon={Calendar}
              label="End Date"
              value={formatDate(item?.endDate, "long")}
            />
          </div>
        </div>

        {/* History */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>History</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard
              icon={Calendar}
              label="Created At"
              value={formatDate(item?.createdAt, "long")}
            />
            <InfoCard
              icon={Calendar}
              label="Updated At"
              value={formatDate(item?.updatedAt, "long") || "Not updated yet"}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

const AnnouncementDetailsDialog = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title="Announcement Details"
    >
      <AnnouncementContent item={item} />
    </ViewDetailsDialog>
  );
};

export { AnnouncementDetailsDialog };
