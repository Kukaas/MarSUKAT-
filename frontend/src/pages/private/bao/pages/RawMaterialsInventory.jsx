import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Eye, Box, Tag, Ruler, AlertCircle, Package, BarChart3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RawMaterialInventoryDetailsDialog } from "../../joborder/components/details/raw-material-inventory-details";
import SectionHeader from "@/components/custom-components/SectionHeader";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { inventoryAPI } from "../../joborder/api/inventoryApi";
import CustomSelect from "@/components/custom-components/CustomSelect";
import MaterialUsageOverviewChart from "../../joborder/components/charts/MaterialUsageOverviewChart";
import { MaterialForecastChart } from "../../joborder/components/charts/MaterialForecastChart";
import { MaterialUsageTable } from "../../joborder/components/tables/MaterialUsageTable";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { productionAPI } from "../../joborder/api/productionApi";
import { format } from "date-fns";
import { useDataFetching } from "@/hooks/useDataFetching";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const RawMaterialsInventory = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("inventory");

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: MONTHS[i]
  }));

  // Define tab configuration
  const tabConfig = [
    { value: "inventory", label: "Inventory Items", icon: Package },
    { value: "usage", label: "Material Usage", icon: BarChart3 },
  ];

  // Fetch inventory data with React Query
  const { 
    data: inventoryData, 
    isLoading,
    error: inventoryError 
  } = useDataFetching(
    ['rawMaterialInventory'],
    () => inventoryAPI.getAllRawMaterialInventory(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        toast.error("Failed to fetch inventory items");
      },
    }
  );

  // Extract categories and material types from inventory data
  const categories = inventoryData ? [...new Set(inventoryData.map(item => item.category))].map(category => ({
    value: category,
    label: category
  })) : [];

  const materialTypes = inventoryData ? inventoryData
    .map(item => ({
      category: item.category,
      type: item.rawMaterialType.name,
      id: `${item.category}-${item.rawMaterialType.name}`
    }))
    .filter((material, index, self) => 
      index === self.findIndex(m => m.id === material.id)
    )
    .map(material => ({
      value: material.id,
      label: `${material.category} - ${material.type}`,
      category: material.category,
      type: material.type
    })) : [];

  // Fetch usage stats with React Query
  const { 
    data: usageStats, 
    isLoading: isUsageLoading,
    error: usageError 
  } = useDataFetching(
    ['materialUsageStats', selectedYear, selectedMonth, selectedCategory, selectedType],
    () => productionAPI.getRawMaterialsUsageStats(
      selectedYear, 
      selectedMonth,
      selectedCategory === "all" ? "" : selectedCategory,
      selectedType === "all" ? "" : selectedType
    ),
    {
      enabled: activeTab === "usage",
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      onError: (error) => {
        toast.error("Failed to fetch material usage statistics");
      },
    }
  );

  // Fetch usage report with React Query
  const { 
    data: usageReport, 
    isLoading: isReportLoading,
    error: reportError 
  } = useDataFetching(
    ['materialUsageReport', startDate, endDate, selectedCategory, selectedType],
    () => productionAPI.getMaterialUsageReport(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
      selectedCategory === "all" ? "" : selectedCategory,
      selectedType === "all" ? "" : selectedType
    ),
    {
      enabled: activeTab === "usage",
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      onError: (error) => {
        toast.error("Failed to fetch material usage report");
      },
    }
  );

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
    {
      key: "createdAt",
      header: "Created At",
      render: (value) => (
        <span>
          {new Date(value).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  // Action handlers
  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
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
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Raw Material Inventory Management"
          description="View and monitor raw material inventory in the system"
        />

        <CustomTabs
          defaultValue="inventory"
          onValueChange={setActiveTab}
          tabs={tabConfig}
        >
          <TabPanel value="inventory">
            <div className="mt-4">
              <DataTable
                data={inventoryData || []}
                columns={columns}
                isLoading={isLoading}
                actionCategories={actionCategories}
                hideCreateButton={true}
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

              <MaterialUsageOverviewChart 
                data={usageStats} 
                loading={isUsageLoading} 
                selectedMaterial={selectedMaterial}
              />

              <MaterialForecastChart data={usageReport} loading={isReportLoading} />
              
              <MaterialUsageTable data={usageReport} loading={isReportLoading} />
            </div>
          </TabPanel>
        </CustomTabs>

        {/* View Dialog */}
        <RawMaterialInventoryDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />
      </div>
    </PrivateLayout>
  );
};

export default RawMaterialsInventory;
