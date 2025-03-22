import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Eye,
  Shirt,
  GraduationCap,
  Ruler,
  AlertCircle,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UniformInventoryDetailsDialog } from "../../joborder/components/details/uniform-inventory-details";
import SectionHeader from "@/components/custom-components/SectionHeader";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { inventoryAPI } from "../../joborder/api/inventoryApi";

const SchoolUniformInventory = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryAPI.getAllUniformInventory();
      setInventory(data);
    } catch (error) {
      toast.error("Failed to fetch inventory items");
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const columns = [
    {
      key: "inventoryId",
      header: "Inventory ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 text-gray-500" />
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
          <Shirt className="h-4 w-4 text-gray-500" />
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

  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
  };

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
          title="School Uniform Inventory"
          description="View school uniform inventory in the system"
        />

        <DataTable
          data={inventory}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          hideCreateButton={true}
        />

        {/* View Dialog */}
        <UniformInventoryDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />
      </div>
    </PrivateLayout>
  );
};

export default SchoolUniformInventory;