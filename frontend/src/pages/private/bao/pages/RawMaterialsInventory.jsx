import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Eye, Box, Tag, Ruler, AlertCircle, Package, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RawMaterialInventoryDetailsDialog } from "../../joborder/components/details/raw-material-inventory-details";
import SectionHeader from "@/components/custom-components/SectionHeader";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { inventoryAPI } from "../../joborder/api/inventoryApi";
import MaterialUsageOverviewChart from "../../joborder/components/charts/MaterialUsageOverviewChart";
import { MaterialForecastChart } from "../../joborder/components/charts/MaterialForecastChart";
import { MaterialUsageTable } from "../../joborder/components/tables/MaterialUsageTable";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { productionAPI } from "../../joborder/api/productionApi";
import { format } from "date-fns";
import { useDataFetching } from "@/hooks/useDataFetching";
import FilterBar from "@/components/custom-components/FilterBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const RawMaterialsInventory = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("inventory");
  const [timePeriod, setTimePeriod] = useState("month");

  // Update date range when month/year changes
  useEffect(() => {
    if (timePeriod === "month") {
      // Set date range for the selected month
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth) - 1; // JavaScript months are 0-indexed
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0); // Last day of month

      setStartDate(firstDay);
      setEndDate(lastDay);
    } else {
      // Set date range for the entire year
      const year = parseInt(selectedYear);
      const firstDay = new Date(year, 0, 1); // January 1
      const lastDay = new Date(year, 11, 31); // December 31

      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  }, [selectedYear, selectedMonth, timePeriod]);

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
    async () => {
      const data = await inventoryAPI.getAllRawMaterialInventory();
      // Sort data by createdAt in descending order (newest first)
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        toast.error("Failed to fetch inventory items");
      },
    }
  );

  // Fetch yearly data for the overview chart - always fetch this
  const {
    data: overviewStats,
    isLoading: isOverviewLoading,
    error: overviewError
  } = useDataFetching(
    ['materialOverviewStats', selectedYear],
    async () => {
      try {
        // Try to get yearly data from the API first
        const yearlyData = await productionAPI.getRawMaterialsYearlyUsageStats(selectedYear);
        console.log("Yearly data from API:", yearlyData);
        return yearlyData;
      } catch (error) {
        console.warn("Yearly API not available, falling back to monthly data aggregation", error);

        // Fallback: Fetch all months separately and combine them
        const monthlyDataPromises = [];
        for (let month = 1; month <= 12; month++) {
          monthlyDataPromises.push(
            productionAPI.getRawMaterialsUsageStats(
              selectedYear,
              month.toString(),
              "", // No category filter
              ""  // No type filter
            ).catch(e => {
              console.warn(`Failed to fetch month ${month}:`, e);
              return { monthlyData: [] };
            })
          );
        }

        // Wait for all month requests to complete
        const monthlyResults = await Promise.all(monthlyDataPromises);
        console.log("Monthly results collected:", monthlyResults);

        // Combine all monthly data into one yearly overview
        const combinedData = {
          totalUsage: 0,
          monthlyData: []
        };

        // Process each month's data
        monthlyResults.forEach((monthData, index) => {
          if (monthData && monthData.monthlyData && monthData.monthlyData.length > 0) {
            // Add this month's data to the combined result
            combinedData.monthlyData = [
              ...combinedData.monthlyData,
              ...monthData.monthlyData
            ];

            // Update total usage if available
            if (monthData.totalUsage) {
              combinedData.totalUsage += monthData.totalUsage;
            }
          } else {
            // Add empty month data to maintain month order
            combinedData.monthlyData.push({
              month: (index + 1).toString(),
              materials: []
            });
          }
        });

        console.log("Combined yearly data from monthly data:", combinedData);
        return combinedData;
      }
    },
    {
      enabled: activeTab === "usage",
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      onError: (error) => {
        console.error("Failed to fetch material overview statistics", error);
        toast.error("Failed to fetch material overview statistics");
      },
    }
  );

  // Fetch usage report with React Query - this should respond to filter changes
  const {
    data: usageReport,
    isLoading: isReportLoading,
    error: reportError,
    refetch: refetchUsageReport
  } = useDataFetching(
    ['materialUsageReport', startDate, endDate, timePeriod],
    () => {
      return productionAPI.getMaterialUsageReport(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        "", // No category filter
        ""  // No type filter
      );
    },
    {
      enabled: activeTab === "usage",
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      onError: (error) => {
        toast.error("Failed to fetch material usage report");
      },
    }
  );

  // Refetch data when filter changes
  useEffect(() => {
    if (activeTab === "usage") {
      refetchUsageReport();
    }
  }, [startDate, endDate, activeTab, refetchUsageReport]);

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

  // Generate print report
  const handlePrintClick = () => {
    toast.info("Generating material usage report...");
    // Implement print functionality here
  };

  // Custom viewing content with period label
  const customViewingContent = (
    <div className="flex flex-wrap items-center gap-1">
      <span className="font-medium">Filtered Reports for:</span>
      <Badge variant="secondary" className="font-normal">
        {timePeriod === "month"
          ? `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`
          : `Year ${selectedYear}`}
      </Badge>
    </div>
  );

  // Period type selector for the filter
  const periodTypeSelector = (
    <div>
      <label className="text-xs font-medium mb-1 block">Time Period</label>
      <div className="flex gap-1 mb-2">
        <Button
          size="sm"
          variant={timePeriod === "month" ? "default" : "outline"}
          className="flex-1 h-8 text-xs"
          onClick={() => setTimePeriod("month")}
        >
          Monthly
        </Button>
        <Button
          size="sm"
          variant={timePeriod === "year" ? "default" : "outline"}
          className="flex-1 h-8 text-xs"
          onClick={() => setTimePeriod("year")}
        >
          Yearly
        </Button>
      </div>
    </div>
  );

  // Check if custom filters are active
  const isCustomFilterActive = () => {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = (new Date().getMonth() + 1).toString();
    return selectedYear !== currentYear ||
           (timePeriod === "month" && selectedMonth !== currentMonth) ||
           timePeriod !== "month";
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedMonth((new Date().getMonth() + 1).toString());
    setTimePeriod("month");
  };

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
              {/* Material usage overview chart - always shows yearly data */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Annual Material Usage Overview</h3>
                <MaterialUsageOverviewChart
                  data={overviewStats}
                  loading={isOverviewLoading}
                />
              </div>

              {/* Divider */}
              <div className="border-t pt-6">
                {/* <h3 className="text-lg font-semibold mb-2">Filtered Material Reports</h3> */}

                {/* Filter bar for the filtered charts */}
                {/* <FilterBar
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  onYearChange={setSelectedYear}
                  onMonthChange={timePeriod === "month" ? setSelectedMonth : undefined}
                  customViewingContent={customViewingContent}
                  onPrintClick={handlePrintClick}
                  printTooltip="Print Material Usage Report"
                  isCustomFilterActive={isCustomFilterActive}
                  filterTitle="Material Usage Filters"
                  resetButtonText="Reset All"
                  onResetFilters={handleResetFilters}
                  periodTypeSelector={periodTypeSelector}
                /> */}

                <div className="mt-6 space-y-6">
                  {/* <MaterialForecastChart data={usageReport} loading={isReportLoading} /> */}
                  <MaterialUsageTable data={usageReport} loading={isReportLoading} />
                </div>
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
      </div>
    </PrivateLayout>
  );
};

export default RawMaterialsInventory;
