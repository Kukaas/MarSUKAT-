import { formatDate, cn } from "@/lib/utils";
import { Tag, Calendar } from "lucide-react";

const DetailItem = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  </div>
);

export function CategoryDetails({ category }) {
  return (
    <div className="flex flex-col h-full divide-y">
      {/* Header Information */}
      <div className="pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Category ID</div>
            <div className="font-semibold text-lg">
              {category?.categoryId || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="py-6 flex-1">
        <h3 className="font-semibold mb-4">Details</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={Tag}
            label="Category"
            value={category?.category || "-"}
          />
          <DetailItem
            icon={Calendar}
            label="Created At"
            value={formatDate(category?.createdAt, "long")}
          />
        </div>
      </div>
    </div>
  );
}
