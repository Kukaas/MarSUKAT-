import { formatDate, cn } from "@/lib/utils";
import {
  Box,
  Calendar,
  Package,
  Tag,
  Ruler,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import StatusBadge from "@/components/custom-components/StatusBadge";

const DetailItem = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  </div>
);

export function RawMaterialInventoryDetails({ item }) {
  // Status message mapping
  const statusMessages = {
    "Low Stock": "This item is running low. Consider restocking soon.",
    "Out of Stock":
      "This item is currently out of stock and needs to be replenished.",
  };

  // Check if we need to show the status alert (only for Low Stock and Out of Stock)
  const showStatusAlert =
    item?.status === "Low Stock" || item?.status === "Out of Stock";

  return (
    <div className="flex flex-col h-full divide-y">
      {/* Header Information */}
      <div className="pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Inventory ID</div>
            <div className="font-semibold text-lg">
              {item?.inventoryId || "-"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={item?.status} icon={AlertCircle} />
          </div>
        </div>
      </div>

      {/* Status Alert - Only for Low Stock and Out of Stock */}
      {showStatusAlert && (
        <div className="py-4">
          <div
            className={cn(
              "p-3 rounded-lg border flex items-start gap-3",
              item?.status === "Low Stock"
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
            )}
          >
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
        </div>
      )}

      {/* Material Image */}
      {item?.image?.data && (
        <div className="py-6">
          <h3 className="font-semibold mb-4">Material Image</h3>
          <div className="relative aspect-square w-full max-w-[200px] mx-auto overflow-hidden rounded-lg">
            <img
              src={item.image.data}
              alt={item.rawMaterialType.name}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Item Details */}
      <div className="py-6 flex-1">
        <h3 className="font-semibold mb-4">Details</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={Package}
            label="Material Type"
            value={item?.rawMaterialType?.name || "-"}
          />
          <DetailItem
            icon={Tag}
            label="Category"
            value={item?.category || "-"}
          />
          <DetailItem
            icon={Ruler}
            label="Quantity"
            value={`${item?.quantity || "-"} ${item?.unit || ""}`}
          />
          <DetailItem
            icon={Calendar}
            label="Created At"
            value={formatDate(item?.createdAt, "long")}
          />
        </div>
      </div>
    </div>
  );
}
