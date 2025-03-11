import { formatDate, cn } from "@/lib/utils";
import { Box, Calendar, Scale, Tag, Package2, Ruler, List } from "lucide-react";

const DetailItem = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-start gap-2", className)}>
    <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
    <div className="min-w-0 space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);

const RawMaterialItem = ({ material }) => (
  <div className="border rounded-lg p-4 space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <DetailItem icon={Tag} label="Category" value={material.category} />
      <DetailItem icon={Package2} label="Type" value={material.type} />
      <DetailItem icon={Scale} label="Quantity" value={material.quantity} />
      <DetailItem icon={Box} label="Unit" value={material.unit} />
    </div>
  </div>
);

export function ProductTypeDetails({ productType }) {
  return (
    <div className="space-y-6 px-6 pb-6">
      {/* Product Type ID */}
      <div>
        <div className="text-sm text-muted-foreground">Product Type ID</div>
        <div className="text-lg font-semibold">
          {productType?.productTypeId || "-"}
        </div>
      </div>

      {/* Basic Details */}
      <div>
        <h3 className="text-base font-semibold mb-4">Basic Details</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={Tag}
            label="Level"
            value={productType?.level || "-"}
          />
          <DetailItem
            icon={Package2}
            label="Product Type"
            value={productType?.productType || "-"}
          />
          <DetailItem
            icon={Ruler}
            label="Size"
            value={productType?.size || "-"}
          />
          <DetailItem
            icon={Scale}
            label="Price"
            value={
              typeof productType?.price === "number"
                ? `₱${productType.price.toFixed(2)}`
                : "-"
            }
          />
          <DetailItem
            icon={Calendar}
            label="Created At"
            value={formatDate(productType?.createdAt, "long")}
          />
        </div>
      </div>

      {/* Raw Materials Section */}
      <div>
        <h3 className="text-base font-semibold mb-4">Raw Materials Used</h3>
        <div className="space-y-4">
          {productType?.rawMaterialsUsed?.length > 0 ? (
            productType.rawMaterialsUsed.map((material, index) => (
              <RawMaterialItem key={index} material={material} />
            ))
          ) : (
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <List className="h-4 w-4" />
              No raw materials specified
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
