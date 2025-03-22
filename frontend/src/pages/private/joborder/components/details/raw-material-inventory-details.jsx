import { formatDate, cn } from "@/lib/utils";
import {
  Box,
  Calendar,
  Package,
  Tag,
  Ruler,
  AlertCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Clock,
  BarChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";
import { useEffect, useState } from "react";
import { inventoryAPI } from "../../api/inventoryApi";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

function RawMaterialInventoryContent({ item }) {
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  // Calculate usage rate from item data
  const getUsageRate = () => {
    if (!item?.usageData) {
      return { daily: 0, monthly: 0, daysRemaining: 0 };
    }
    
    return {
      daily: item.usageData.dailyConsumptionRate || 0,
      monthly: item.usageData.monthlyConsumptionRate || 0,
      daysRemaining: item.usageData.estimatedDaysRemaining || 0
    };
  };

  // Status message mapping
  const statusMessages = {
    "Low Stock": "This item is running low. Consider restocking soon.",
    "Out of Stock":
      "This item is currently out of stock and needs to be replenished.",
  };

  // Check if we need to show the status alert
  const showStatusAlert =
    item?.status === "Low Stock" || item?.status === "Out of Stock";

  const usageRates = getUsageRate();

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Inventory Info */}
        <div className="relative">
          <div className="absolute inset-0 h-32 sm:h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4 ring-4 ring-background shadow-xl">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center pb-3 sm:pb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                {item?.rawMaterialType?.name || "-"}
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
              icon={Package}
              label="Material Type"
              value={item?.rawMaterialType?.name || "-"}
            />
            <InfoCard
              icon={Tag}
              label="Category"
              value={item?.category || "-"}
            />
          </div>
        </div>

        {/* Quantity Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Quantity Details</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1">
            <InfoCard
              icon={Ruler}
              label="Current Stock"
              value={`${item?.quantity || "-"} ${item?.unit || ""}`}
            />
          </div>
        </div>

        {/* Usage Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Usage Analysis</SectionTitle>
          {isLoadingUsage ? (
            <Card>
              <CardContent className="p-4 flex justify-center items-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading usage data...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <InfoCard
                  icon={TrendingUp}
                  label="Daily Consumption"
                  value={`${usageRates.daily.toFixed(2)} ${item?.unit || ""}/day`}
                />
                <InfoCard
                  icon={TrendingUp}
                  label="Monthly Consumption"
                  value={`${usageRates.monthly.toFixed(2)} ${item?.unit || ""}/month`}
                />
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Inventory Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated days remaining:</span>
                        <span className="font-medium">{usageRates.daysRemaining} days</span>
                      </div>
                      <Progress 
                        value={Math.min(usageRates.daysRemaining / 60 * 100, 100)} 
                        className={cn(
                          usageRates.daysRemaining <= 7 ? "bg-red-200" : 
                          usageRates.daysRemaining <= 30 ? "bg-amber-200" : "bg-green-200"
                        )}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Critical</span>
                        <span>Low</span>
                        <span>Good</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Material Image */}
        {item?.image?.data && (
          <div className="space-y-4 sm:space-y-6">
            <SectionTitle>Material Image</SectionTitle>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square w-full max-w-[300px] mx-auto">
                  <img
                    src={item.image.data}
                    alt={item.rawMaterialType.name}
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

const RawMaterialInventoryDetailsDialog = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title="Inventory Item Details"
    >
      <RawMaterialInventoryContent item={item} />
    </ViewDetailsDialog>
  );
};

// Add RawMaterialInventoryDetails export for backward compatibility
const RawMaterialInventoryDetails = ({ item }) => (
  <RawMaterialInventoryContent item={item} />
);

export { RawMaterialInventoryDetailsDialog, RawMaterialInventoryDetails };
