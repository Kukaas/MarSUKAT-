import { formatDate, cn } from "@/lib/utils";
import {
  GraduationCap,
  Calendar,
  Shirt,
  Ruler,
  AlertCircle,
  AlertTriangle,
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

function UniformInventoryContent({ item }) {
  const statusMessages = {
    "Low Stock": "This uniform is running low. Consider restocking soon.",
    "Out of Stock":
      "This uniform is currently out of stock and needs to be replenished.",
  };

  const showStatusAlert =
    item?.status === "Low Stock" || item?.status === "Out of Stock";

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Inventory Info */}
        <div className="relative">
          <div className="absolute inset-0 h-32 sm:h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4 ring-4 ring-background shadow-xl">
              <Shirt className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center pb-3 sm:pb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                {item?.productType || "-"}
              </h3>
              <div className="flex flex-col gap-2 items-center">
                <StatusBadge
                  status={item?.inventoryId || "Unknown"}
                  icon={Info}
                  className="text-xs sm:text-sm"
                />
                <StatusBadge
                  status={item?.status || "Unknown"}
                  icon={AlertCircle}
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {showStatusAlert && (
          <div className="space-y-4 sm:space-y-6">
            <SectionTitle>Status Alert</SectionTitle>
            <Card
              className={cn(
                "border-dashed",
                item?.status === "Low Stock"
                  ? "border-amber-200 dark:border-amber-800"
                  : "border-red-200 dark:border-red-800"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={cn(
                      "h-5 w-5 mt-0.5",
                      item?.status === "Low Stock"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        item?.status === "Low Stock"
                          ? "text-amber-800 dark:text-amber-300"
                          : "text-red-800 dark:text-red-300"
                      )}
                    >
                      {item?.status === "Low Stock"
                        ? "Low Stock Alert"
                        : "Out of Stock Alert"}
                    </p>
                    <p
                      className={cn(
                        "text-sm mt-1",
                        item?.status === "Low Stock"
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-red-700 dark:text-red-400"
                      )}
                    >
                      {statusMessages[item?.status]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Basic Information</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard
              icon={GraduationCap}
              label="Level"
              value={item?.level || "-"}
            />
            <InfoCard
              icon={Shirt}
              label="Product Type"
              value={item?.productType || "-"}
            />
            <InfoCard icon={Ruler} label="Size" value={item?.size || "-"} />
          </div>
        </div>

        {/* Quantity Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Quantity Details</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1">
            <InfoCard
              icon={Ruler}
              label="Current Stock"
              value={item?.quantity || "-"}
            />
          </div>
        </div>

        {/* Uniform Image */}
        {item?.image?.data && (
          <div className="space-y-4 sm:space-y-6">
            <SectionTitle>Uniform Image</SectionTitle>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square w-full max-w-[300px] mx-auto">
                  <img
                    src={item.image.data}
                    alt={item.productType}
                    className="object-cover w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

const UniformInventoryDetailsDialog = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title="Uniform Item Details"
    >
      <UniformInventoryContent item={item} />
    </ViewDetailsDialog>
  );
};

export { UniformInventoryDetailsDialog, UniformInventoryContent };
