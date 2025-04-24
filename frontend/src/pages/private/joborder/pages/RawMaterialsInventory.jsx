import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Box,
  Tag,
  Ruler,
  Package,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Calendar
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RawMaterialInventoryDetails } from "../components/details/raw-material-inventory-details";
import RawMaterialInventoryForm from "../forms/RawMaterialInventoryForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { inventoryAPI } from "../api/inventoryApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { RawMaterialInventoryDetailsDialog } from "../components/details/raw-material-inventory-details";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CustomSelect from "@/components/custom-components/CustomSelect";
import { format } from "date-fns";
import { productionAPI } from "../api/productionApi";
import StatsCard from "@/components/custom-components/StatsCard";
import MaterialUsageOverviewChart from "../components/charts/MaterialUsageOverviewChart";
import { MaterialForecastChart } from "../components/charts/MaterialForecastChart";
import { MaterialUsageTable } from "../components/tables/MaterialUsageTable";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

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

export default function RawMaterialsInventory() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    rawMaterialType: "",
    unit: "",
    quantity: "",
    status: "Available",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());

  // Define tab configuration
  const tabConfig = [
    { value: "inventory", label: "Inventory Items", icon: Package },
    { value: "usage", label: "Material Usage", icon: BarChart3 },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: MONTHS[i]
  }));

  // Fetch inventory data with caching
  const { data: inventoryData, isLoading, refetch: refetchInventory } = useDataFetching(
    ['rawMaterialInventory'],
    async () => {
      const data = await inventoryAPI.getAllRawMaterialInventory();

      // Sort data by createdAt in descending order (newest first)
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Extract unique categories
      const uniqueCategories = [...new Set(sortedData.map(item => item.category))];
      const categories = uniqueCategories.map(category => ({
        value: category,
        label: category
      }));

      // Extract unique material types with their categories
      const materials = sortedData.map(item => ({
        category: item.category,
        type: item.rawMaterialType.name,
        id: `${item.category}-${item.rawMaterialType.name}`
      }));

      const uniqueMaterials = materials.filter((material, index, self) =>
        index === self.findIndex(m => m.id === material.id)
      );

      const materialTypes = uniqueMaterials.map(material => ({
        value: material.id,
        label: `${material.category} - ${material.type}`,
        category: material.category,
        type: material.type
      }));

      return {
        inventory: sortedData,
        categories,
        materialTypes
      };
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  const inventory = inventoryData?.inventory || [];
  const categories = inventoryData?.categories || [];
  const materialTypes = inventoryData?.materialTypes || [];

  // Create mutation
  const createMutation = useDataMutation(
    ['rawMaterialInventory'],
    async (data) => {
      const result = await inventoryAPI.createRawMaterialInventory(data);
      await refetchInventory();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Inventory item created successfully");
        setIsCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create inventory item");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['rawMaterialInventory'],
    async (data) => {
      const result = await inventoryAPI.updateRawMaterialInventory(selectedId, data);
      await refetchInventory();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Inventory item updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update inventory item");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['rawMaterialInventory'],
    async (id) => {
      const result = await inventoryAPI.deleteRawMaterialInventory(id);
      await refetchInventory();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Inventory item deleted successfully");
        setDeleteDialog({ isOpen: false, itemToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete inventory item");
      },
    }
  );

  // Fetch usage stats with caching
  const { data: usageStats, isLoading: isUsageLoading } = useDataFetching(
    ['materialUsageStats', selectedYear, selectedMonth, selectedCategory, selectedType],
    async () => {
      const stats = await productionAPI.getRawMaterialsUsageStats(
        selectedYear,
        selectedMonth,
        selectedCategory === "all" ? "" : selectedCategory,
        selectedType === "all" ? "" : selectedType
      );
      return stats;
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      enabled: activeTab === "usage",
    }
  );

  // Fetch usage report with caching
  const { data: usageReport, isLoading: isReportLoading } = useDataFetching(
    ['materialUsageReport', startDate, endDate, selectedCategory, selectedType],
    async () => {
      const report = await productionAPI.getMaterialUsageReport(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        selectedCategory === "all" ? "" : selectedCategory,
        selectedType === "all" ? "" : selectedType
      );
      return report;
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      enabled: activeTab === "usage",
    }
  );

  // Helper functions for usage statistics
  const calculateTotalUsage = () => {
    if (!usageStats || !usageStats.monthlyData || usageStats.monthlyData.length === 0) {
      return 0;
    }

    const monthData = usageStats.monthlyData.find(m => m.month === parseInt(selectedMonth));
    if (!monthData) return 0;

    return monthData.materials.reduce((total, material) => total + material.quantity, 0);
  };

  const getMaterialsCount = () => {
    if (!usageStats || !usageStats.currentInventory) return 0;
    return usageStats.currentInventory.length;
  };

  const getLowStockCount = () => {
    if (!usageStats || !usageStats.currentInventory) return 0;
    return usageStats.currentInventory.filter(material =>
      material.status === "Low Stock" || material.status === "Out of Stock"
    ).length;
  };

  const getMostUsedMaterial = () => {
    if (!usageStats || !usageStats.yearlyData || usageStats.yearlyData.length === 0) {
      return { type: "None", quantity: 0, unit: "" };
    }

    const yearData = usageStats.yearlyData.find(y => y.year === parseInt(selectedYear));
    if (!yearData || !yearData.materials || yearData.materials.length === 0) {
      return { type: "None", quantity: 0, unit: "" };
    }

    return yearData.materials.reduce((prev, current) =>
      (prev.quantity > current.quantity) ? prev : current
    );
  };

  // Column definitions
  const columns = [
    {
      key: "inventoryId",
      header: "Inventory ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "rawMaterialType",
      header: "Material Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value.name}</span>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            {value} {row.unit}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={value} icon={AlertCircle} />,
    },
  ];

  // Action handlers
  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      category: row.category,
      rawMaterialType: row.rawMaterialType._id,
      unit: row.unit,
      quantity: row.quantity,
      status: row.status,
      image: row.image,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      itemToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.itemToDelete) {
      await deleteMutation.mutateAsync(deleteDialog.itemToDelete._id);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteMutation.isPending) {
      setDeleteDialog({ isOpen: false, itemToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsEditing(false);
      setFormData({
        category: "",
        rawMaterialType: "",
        unit: "",
        quantity: "",
        status: "Available",
      });
      setSelectedId(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Clean up function for dialog close
  const handleDialogClose = (type) => {
    if (type === "edit") {
      setIsEditDialogOpen(false);
      setIsEditing(false);
      setSelectedId(null);
    } else if (type === "create") {
      setIsCreateDialogOpen(false);
    }
    setFormData({
      category: "",
      rawMaterialType: "",
      unit: "",
      quantity: "",
      status: "Available",
    });
  };

  // Define actions for the inventory items
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
    edit: {
      label: "Edit Actions",
      actions: [
        {
          label: "Edit",
          icon: Edit2,
          onClick: handleEdit,
        },
      ],
    },
    delete: {
      label: "Delete Actions",
      actions: [
        {
          label: "Delete",
          icon: Trash2,
          onClick: handleDeleteClick,
          variant: "destructive",
        },
      ],
    },
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Raw Material Inventory Management"
          description="Manage raw material inventory in the system"
        />

        <CustomTabs
          defaultValue="inventory"
          onValueChange={setActiveTab}
          tabs={tabConfig}
        >
          <TabPanel value="inventory">
            <div className="mt-4">
              <DataTable
                data={inventory}
                columns={columns}
                isLoading={isLoading}
                actionCategories={actionCategories}
                onCreateNew={() => {
                  setFormData({
                    category: "",
                    rawMaterialType: "",
                    unit: "",
                    quantity: "",
                    status: "Available",
                  });
                  setIsCreateDialogOpen(true);
                }}
                createButtonText={
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Inventory Item</span>
                  </div>
                }
              />
            </div>
          </TabPanel>

          <TabPanel value="usage">
            <div className="space-y-6 mt-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/4">
                  <CustomSelect
                    name="year"
                    label="Year"
                    placeholder="Select year"
                    options={years.map(year => ({ value: year, label: year }))}
                    value={selectedYear}
                    onChange={setSelectedYear}
                  />
                </div>
                <div className="w-full md:w-1/4">
                  <CustomSelect
                    name="month"
                    label="Month"
                    placeholder="Select month"
                    options={months}
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                  />
                </div>
                <div className="w-full md:w-1/4">
                  <CustomSelect
                    name="category"
                    label="Material Category"
                    placeholder="All Categories"
                    options={[{ value: "all", label: "All Categories" }, ...categories]}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>
                <div className="w-full md:w-1/4">
                  <CustomSelect
                    name="type"
                    label="Material Type"
                    placeholder="All Types"
                    options={[
                      { value: "all", label: "All Types" },
                      ...materialTypes.filter(material =>
                        selectedCategory === "all" || material.category === selectedCategory
                      )
                    ]}
                    value={selectedType}
                    onChange={setSelectedType}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Total Materials Used"
                  value={calculateTotalUsage().toFixed(2)}
                  icon={<Package className="h-4 w-4 text-muted-foreground" />}
                  description="Units used this period"
                  isLoading={isUsageLoading}
                />
                <StatsCard
                  title="Materials Tracked"
                  value={getMaterialsCount()}
                  icon={<Package className="h-4 w-4 text-muted-foreground" />}
                  description="Distinct materials in use"
                  isLoading={isUsageLoading}
                />
                <StatsCard
                  title="Low Stock Materials"
                  value={getLowStockCount()}
                  icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                  description="Materials needing restock"
                  variant={getLowStockCount() > 0 ? "destructive" : "default"}
                  isLoading={isUsageLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-8">
                <MaterialUsageOverviewChart
                  data={usageStats}
                  loading={isUsageLoading}
                  selectedMaterial={selectedMaterial}
                />

                {/* <MaterialForecastChart data={usageReport} loading={isReportLoading} /> */}

                <MaterialUsageTable data={usageReport} loading={isReportLoading} />
              </div>
            </div>
          </TabPanel>
        </CustomTabs>

        {/* View Dialog */}
        <RawMaterialInventoryDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Inventory Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new item to the raw material inventory
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <RawMaterialInventoryForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={createMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !createMutation.isPending && handleDialogClose("create")}
                disabled={createMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="rawMaterialInventoryForm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <AlertDialog open={isEditDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Edit Inventory Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the inventory item details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <RawMaterialInventoryForm
                  formData={formData}
                  setFormData={setFormData}
                  isEdit={true}
                  onSubmit={handleSubmit}
                  isSubmitting={updateMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !updateMutation.isPending && handleDialogClose("edit")}
                disabled={updateMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="rawMaterialInventoryForm"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Inventory Item"
          description={
            deleteDialog.itemToDelete
              ? `Are you sure you want to delete the inventory item "${deleteDialog.itemToDelete.rawMaterialType.name}"? This action cannot be undone.`
              : "Are you sure you want to delete this inventory item? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PrivateLayout>
  );
}
