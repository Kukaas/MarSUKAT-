import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { useState } from "react";
import { toast } from "sonner";
import { productionAPI } from "../api/productionApi";
import { inventoryAPI } from "../api/inventoryApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { Package, TrendingUp, BarChart3, Table2, Calendar } from "lucide-react";
import MaterialUsageOverviewChart from "../components/charts/MaterialUsageOverviewChart";
import { MaterialForecastChart } from "../components/charts/MaterialForecastChart";
import { MaterialUsageTable } from "../components/tables/MaterialUsageTable";
import CustomSelect from "@/components/custom-components/CustomSelect";
import StatsCard from "@/components/custom-components/StatsCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { DataTable } from "@/components/custom-components/DataTable";
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

export default function MaterialUsageMonitoring() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [filteredTypes, setFilteredTypes] = useState(["all"]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  // Define tab configuration
  const tabConfig = [
    { value: "overview", label: "Monthly Overview", icon: BarChart3 },
    { value: "forecast", label: "Usage Forecast", icon: TrendingUp },
    { value: "details", label: "Detailed Report", icon: Table2 },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: MONTHS[i]
  }));

  // Fetch categories and materials with caching
  const { data: categoriesData, isLoading: isCategoriesLoading } = useDataFetching(
    ['materialCategories'],
    async () => {
      const response = await inventoryAPI.getAllRawMaterials();
      if (response.success) {
        // Extract unique categories and materials
        const uniqueCategories = [...new Set(response.data.map(item => item.category))];
        
        // Create materials mapping organized by category and type
        const materialsMap = response.data.reduce((acc, material) => {
          if (!acc[material.category]) {
            acc[material.category] = {};
          }
          if (!acc[material.category][material.type]) {
            acc[material.category][material.type] = [];
          }
          acc[material.category][material.type].push({
            id: `${material.category}-${material.type}`,
            name: `${material.name}`,
            unit: material.unit
          });
          return acc;
        }, {});
        
        return {
          categories: ["all", ...uniqueCategories],
          materialTypes: materialsMap,
          materials: response.data
        };
      }
      throw new Error("Failed to fetch categories");
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  const categories = categoriesData?.categories || [];
  const materialTypes = categoriesData?.materialTypes || {};
  const materials = categoriesData?.materials || [];

  // Fetch usage stats with caching
  const { data: usageStats, isLoading: isStatsLoading } = useDataFetching(
    ['materialUsageStats', selectedYear, selectedMonth, selectedCategory, selectedType, selectedMaterial],
    async () => {
      const categoryParam = selectedCategory !== "all" ? selectedCategory : "";
      const typeParam = selectedType !== "all" ? selectedType : "";
      const materialParam = selectedMaterial !== "all" ? selectedMaterial : "";

      const response = await productionAPI.getMaterialUsageStats(
        selectedYear,
        selectedMonth !== "all" ? selectedMonth : "",
        categoryParam,
        typeParam,
        materialParam
      );

      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch material usage data");
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  // Fetch usage report with caching
  const { data: usageReport, isLoading: isReportLoading, refetch: refetchReport } = useDataFetching(
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
    }
  );

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

  // Define columns for the DataTable in detailed report
  const reportColumns = [
    {
      key: "type",
      header: "Material Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (value) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: "totalQuantity",
      header: "Total Usage",
      render: (value, row) => (
        <span className="font-medium">{value.toFixed(2)} {row.unit}</span>
      ),
    },
    {
      key: "currentInventory",
      header: "Current Stock",
      render: (value, row) => (
        <span className="font-medium">{value.toFixed(2)} {row.unit}</span>
      ),
    },
    {
      key: "dailyConsumptionRate",
      header: "Daily Consumption",
      render: (value, row) => (
        <span className="font-medium">{value} {row.unit}/day</span>
      ),
    },
  ];

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedType("all");
    setSelectedMaterial("all");
    
    if (value === "all") {
      setFilteredTypes(["all"]);
      return;
    }
    
    const types = Object.keys(materialTypes[value] || {});
    setFilteredTypes(["all", ...types]);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setSelectedMaterial("all");
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Raw Material Usage Monitoring"
          description="Track and analyze raw material consumption over time"
        />

        <div className="flex flex-col gap-8">
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
                options={[
                  { value: "all", label: "All Months" },
                  ...months.map((month, index) => ({
                    value: (index + 1).toString(),
                    label: month
                  }))
                ]}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>
            <div className="w-full md:w-1/4">
              <CustomSelect
                name="category"
                label="Category"
                placeholder="All Categories"
                options={categories.map(category => ({
                  value: category,
                  label: category === "all" ? "All Categories" : category
                }))}
                value={selectedCategory}
                onChange={handleCategoryChange}
                isLoading={isCategoriesLoading}
              />
            </div>
            <div className="w-full md:w-1/4">
              <CustomSelect
                name="material"
                label="Material"
                placeholder="All Materials"
                options={[
                  { value: "all", label: "All Materials" },
                  ...(materialTypes[selectedCategory]?.[selectedType]?.map(material => ({
                    value: material.id,
                    label: material.name
                  })) || [])
                ]}
                value={selectedMaterial}
                onChange={setSelectedMaterial}
                isLoading={isCategoriesLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
            <CustomSelect
              value={selectedType}
              onValueChange={handleTypeChange}
              label="Material Type"
              options={filteredTypes.map(type => ({
                value: type,
                label: type === "all" ? "All Types" : type
              }))}
              isLoading={isCategoriesLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Materials Used"
              value={calculateTotalUsage().toFixed(2)}
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              description="Units used this period"
              isLoading={isStatsLoading}
            />
            <StatsCard 
              title="Materials Tracked"
              value={getMaterialsCount()}
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              description="Distinct materials in use"
              isLoading={isStatsLoading}
            />
            <StatsCard 
              title="Low Stock Materials"
              value={getLowStockCount()}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              description="Materials needing restock"
              variant={getLowStockCount() > 0 ? "destructive" : "default"}
              isLoading={isStatsLoading}
            />
          </div>

          <CustomTabs 
            defaultValue="overview" 
            onValueChange={setActiveTab}
            tabs={tabConfig}
          >
            <TabPanel value="overview">
              <div className="grid grid-cols-1 gap-8 mt-4">
                <MaterialUsageOverviewChart 
                  data={usageStats} 
                  loading={isStatsLoading} 
                  selectedMaterial={selectedMaterial}
                />
              </div>
            </TabPanel>

            <TabPanel value="forecast">
              <div className="grid grid-cols-1 gap-8 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Date Range Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Start Date</div>
                        <DatePicker 
                          date={startDate} 
                          onSelect={setStartDate}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">End Date</div>
                        <DatePicker 
                          date={endDate} 
                          onSelect={setEndDate}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        onClick={refetchReport} 
                        disabled={isReportLoading}
                      >
                        {isReportLoading ? (
                          <>
                            <span className="loading loading-spinner loading-sm mr-2"></span>
                            Loading...
                          </>
                        ) : (
                          "Update Report"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <MaterialForecastChart data={usageReport} loading={isReportLoading} />
                
                <MaterialUsageTable data={usageReport} loading={isReportLoading} />
              </div>
            </TabPanel>

            <TabPanel value="details">
              <div className="grid grid-cols-1 gap-8 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Date Range Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Start Date</div>
                        <DatePicker 
                          date={startDate} 
                          onSelect={setStartDate}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">End Date</div>
                        <DatePicker 
                          date={endDate} 
                          onSelect={setEndDate}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        onClick={refetchReport} 
                        disabled={isReportLoading}
                      >
                        {isReportLoading ? (
                          <>
                            <span className="loading loading-spinner loading-sm mr-2"></span>
                            Loading...
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Material Usage Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!usageReport || !usageReport.materialUsage ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">No material usage data available</p>
                      </div>
                    ) : (
                      <DataTable
                        data={usageReport.materialUsage}
                        columns={reportColumns}
                        isLoading={isReportLoading}
                        emptyMessage="No material usage data available for the selected period."
                        actionCategories={{
                          view: {
                            label: "View Details",
                            actions: [
                              {
                                label: "View Breakdown",
                                icon: Table2,
                                onClick: (row) => {
                                  console.log("View breakdown for:", row);
                                },
                              },
                            ],
                          },
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
                
                {usageReport && usageReport.materialUsage && usageReport.materialUsage.length > 0 && (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-8">
                      {usageReport.materialUsage.map((material, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <h3 className="font-semibold text-lg mb-2">{material.type} ({material.category})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Total Usage:</span>
                              <p className="font-medium">{material.totalQuantity.toFixed(2)} {material.unit}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Current Stock:</span>
                              <p className="font-medium">{material.currentInventory.toFixed(2)} {material.unit}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Daily Consumption:</span>
                              <p className="font-medium">{material.dailyConsumptionRate} {material.unit}/day</p>
                            </div>
                          </div>
                          
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Usage by Product</h4>
                          <DataTable
                            data={material.usageByProduct}
                            columns={[
                              { key: "level", header: "Level" },
                              { key: "type", header: "Product Type" },
                              { key: "size", header: "Size" },
                              { 
                                key: "quantity", 
                                header: "Quantity",
                                render: (value) => `${value.toFixed(2)} ${material.unit}`
                              }
                            ]}
                            isLoading={isReportLoading}
                          />
                          
                          <h4 className="font-medium mb-2 mt-4 text-sm text-muted-foreground">Monthly Usage</h4>
                          <DataTable
                            data={material.monthlyUsage}
                            columns={[
                              { key: "year", header: "Year" },
                              { 
                                key: "month", 
                                header: "Month",
                                render: (value) => MONTHS[value - 1]
                              },
                              { 
                                key: "quantity", 
                                header: "Quantity",
                                render: (value) => `${value.toFixed(2)} ${material.unit}`
                              }
                            ]}
                            isLoading={isReportLoading}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabPanel>
          </CustomTabs>
        </div>
      </div>
    </PrivateLayout>
  );
} 