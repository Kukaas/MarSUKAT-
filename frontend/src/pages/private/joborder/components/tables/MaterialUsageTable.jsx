import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Clock, Eye } from "lucide-react";
import { DataTable } from "@/components/custom-components/DataTable";
import { useState } from "react";
import { RawMaterialInventoryDetailsDialog } from "../details/raw-material-inventory-details";
import SectionHeader from "@/components/custom-components/SectionHeader";
import StatusBadge from "@/components/custom-components/StatusBadge";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MaterialUsageTable({ data, loading }) {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const columns = [
    {
      key: "type",
      header: "Material",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "totalQuantity",
      header: "Total Used",
      render: (value, row) => `${value.toFixed(2)} ${row.unit}`,
    },
    {
      key: "currentInventory",
      header: "Current Stock",
      render: (value, row) => `${value.toFixed(2)} ${row.unit}`,
    },
    {
      key: "dailyConsumptionRate",
      header: "Daily Usage",
      render: (value, row) => `${value} ${row.unit}/day`,
    },
    {
      key: "estimatedDaysRemaining",
      header: "Forecast",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{value > 0 ? `${value} days left` : "Depleted"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => <MaterialStatusBadge material={row} />,
    },
  ];

  const handleViewDetails = (material) => {
    // Format the material data to match what the details dialog expects
    const formattedMaterial = {
      rawMaterialType: { name: material.type },
      category: material.category,
      quantity: material.currentInventory,
      unit: material.unit,
      status: getStatusName(material.estimatedDaysRemaining),
      inventoryId: `MAT-${material.type.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _id: material.id || `material-${Math.random().toString(36).substr(2, 9)}`,
      // Add usage data
      usageData: {
        dailyConsumptionRate: material.dailyConsumptionRate,
        monthlyConsumptionRate: material.dailyConsumptionRate * 30,
        estimatedDaysRemaining: material.estimatedDaysRemaining
      }
    };
    
    setSelectedMaterial(formattedMaterial);
    setDetailsOpen(true);
  };

  const getStatusName = (daysRemaining) => {
    if (daysRemaining <= 0) return "Out of Stock";
    if (daysRemaining <= 7) return "Critical";
    if (daysRemaining <= 30) return "Low Stock";
    return "In Stock";
  };

  return (
    <>
    <SectionHeader
          title="Material Usage Details"
          description="View material usage details"
        />
          <DataTable
            data={data?.materialUsage || []}
            columns={columns}
            isLoading={loading}
            emptyMessage="No material usage data available"
            actionCategories={{
              view: {
                label: "View Options",
                actions: [
                  {
                    label: "View Material Details",
                    icon: Eye,
                    onClick: handleViewDetails
                  },
                  {
                    label: (row) => row.estimatedDaysRemaining <= 7 ? "Order Now" : "Order More",
                    icon: AlertTriangle,
                    variant: row => row.estimatedDaysRemaining <= 7 ? "destructive" : "default",
                    onClick: (row) => {
                      console.log("Order more:", row);
                    },
                    show: (row) => row.estimatedDaysRemaining < 30,
                  },
                ],
              },
            }}
          />

      {/* Material Details Dialog */}
      <RawMaterialInventoryDetailsDialog
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        item={selectedMaterial}
      />
    </>
  );
}

function MaterialStatusBadge({ material }) {
  const getStatus = () => {
    if (material.estimatedDaysRemaining <= 0) {
      return "Out of Stock";
    } else if (material.estimatedDaysRemaining <= 7) {
      return "Critical";
    } else if (material.estimatedDaysRemaining <= 30) {
      return "Low Stock";
    }
    return "In Stock";
  };

  return (
    <StatusBadge
      status={getStatus()}
      icon={AlertTriangle}
      className="text-xs"
    />
  );
} 