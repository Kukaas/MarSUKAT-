import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Eye, Box, Tag, Ruler, AlertCircle, Package, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function RawMaterialsInventory() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [categories, setCategories] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("inventory");

  // Material usage monitoring states
  const [isUsageLoading, setIsUsageLoading] = useState(true);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [usageStats, setUsageStats] = useState(null);
  const [usageReport, setUsageReport] = useState(null);

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

  // Fetch usage stats
  const fetchUsageStats = async () => {
    try {
      setIsUsageLoading(true);
      const stats = await productionAPI.getRawMaterialsUsageStats(
        selectedYear, 
        selectedMonth,
        selectedCategory === "all" ? "" : selectedCategory,
        selectedType === "all" ? "" : selectedType
      );
      setUsageStats(stats);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      toast.error("Failed to fetch material usage statistics");
    } finally {
      setIsUsageLoading(false);
    }
  };

  // Fetch usage report
  const fetchUsageReport = async () => {
    try {
      setIsReportLoading(true);
      const report = await productionAPI.getMaterialUsageReport(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        selectedCategory === "all" ? "" : selectedCategory,
        selectedType === "all" ? "" : selectedType
      );
      setUsageReport(report);
    } catch (error) {
      console.error("Error fetching usage report:", error);
      toast.error("Failed to fetch material usage report");
    } finally {
      setIsReportLoading(false);
    }
  };

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryAPI.getAllRawMaterialInventory();
      setInventory(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories.map(category => ({
        value: category,
        label: category
      })));
      
      // Extract unique material types with their categories
      const materials = data.map(item => ({
        category: item.category,
        type: item.rawMaterialType.name,
        id: `${item.category}-${item.rawMaterialType.name}`
      }));
      
      const uniqueMaterials = materials.filter((material, index, self) => 
        index === self.findIndex(m => m.id === material.id)
      );
      
      setMaterialTypes(uniqueMaterials.map(material => ({
        value: material.id,
        label: `${material.category} - ${material.type}`,
        category: material.category,
        type: material.type
      })));
      
    } catch (error) {
      toast.error("Failed to fetch inventory items");
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInventory();
  }, []);

  // Fetch usage data when usage tab is active
  useEffect(() => {
    if (activeTab === "usage") {
      fetchUsageStats();
      fetchUsageReport();
    }
  }, [activeTab]);

  // Fetch usage stats when filters change
  useEffect(() => {
    if (activeTab === "usage") {
      fetchUsageStats();
    }
  }, [selectedYear, selectedMonth, selectedCategory, selectedType, activeTab]);

  // Fetch usage report when date range or filters change
  useEffect(() => {
    if (activeTab === "usage") {
      fetchUsageReport();
    }
  }, [startDate, endDate, selectedCategory, selectedType, activeTab]);

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
                    data={inventory}
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
}
