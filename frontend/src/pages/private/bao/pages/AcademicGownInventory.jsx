import { useState } from "react";
import { toast } from "sonner";
import { Eye, GraduationCap, Ruler, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/custom-components/DataTable";
import PrivateLayout from "../../PrivateLayout";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { AcademicGownInventoryDetailsDialog } from "../../joborder/components/details/academic-gown-inventory-details";
import { inventoryAPI } from "../../joborder/api/inventoryApi";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { useDataFetching } from "@/hooks/useDataFetching";

const AcademicGownInventory = () => {
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  // Fetch inventory data with React Query
  const { 
    data: inventoryItems, 
    isLoading,
    error: inventoryError 
  } = useDataFetching(
    ['academicGownInventory'],
    () => inventoryAPI.getAllAcademicGownInventory(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        toast.error("Failed to fetch inventory items");
      },
    }
  );

  const handleView = (row) => {
    setSelectedInventory(row);
    setViewDetailsOpen(true);
  };

  const columns = [
    {
      key: "inventoryId",
      header: "Inventory ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "productType",
      header: "Product Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={value} icon={AlertCircle} />,
    },
  ];

  const actionCategories = {
    view: {
      label: "View Actions",
      actions: [
        {
          label: "View Details",
          icon: Eye,
          onClick: handleView,
        },
      ],
    },
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Academic Gown Inventory"
          description="View academic gown inventory data"
        />

        <div className="flex flex-col gap-8">
          <DataTable
            className="mt-4"
            data={inventoryItems || []}
            columns={columns}
            isLoading={isLoading}
            actionCategories={actionCategories}
          />
        </div>

        {/* View Dialog */}
        <AcademicGownInventoryDetailsDialog
          isOpen={viewDetailsOpen}
          onClose={() => setViewDetailsOpen(false)}
          item={selectedInventory}
        />
      </div>
    </PrivateLayout>
  );
};

export default AcademicGownInventory;