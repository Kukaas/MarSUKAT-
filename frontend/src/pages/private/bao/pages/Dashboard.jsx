import { useEffect, useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { toast } from "sonner";
import CustomSelect from "@/components/custom-components/CustomSelect";
import StatsCard from "@/components/custom-components/StatsCard";
import { CustomChart } from "@/components/custom-components/CustomChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { useDataFetching } from "@/hooks/useDataFetching";
import FilterBar from "@/components/custom-components/FilterBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  Shirt,
  ShoppingCart,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Package,
  Clipboard,
  CalendarDays,
} from "lucide-react";
import { dashboardAPI } from "../../joborder/api/dashboardApi";

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

const WEEKS = Array.from({ length: 5 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Week ${i + 1}`,
}));

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [timeframe, setTimeframe] = useState("month");

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - i).toString(),
    label: (new Date().getFullYear() - i).toString(),
  }));
  
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: MONTHS[i],
  }));

  // Custom viewing content with period label
  const customViewingContent = (
    <div className="flex flex-wrap items-center gap-1">
      <span className="font-medium">Viewing:</span>
      <Badge variant="secondary" className="font-normal">
        {timeframe === "week" 
          ? `Week ${selectedWeek}, ${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`
          : timeframe === "month"
            ? `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`
            : `Year ${selectedYear}`}
      </Badge>
    </div>
  );

  // Check if custom filters are applied
  const isCustomFilterActive = () => {
    return (
      selectedYear !== new Date().getFullYear().toString() || 
      selectedMonth !== (new Date().getMonth() + 1).toString() ||
      selectedWeek !== "1" ||
      timeframe !== "month"
    );
  };

  // Reset filters function
  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedMonth((new Date().getMonth() + 1).toString());
    setSelectedWeek("1");
    setTimeframe("month");
  };

  // Period type selector for the top of the filter
  const periodTypeSelector = (
    <div>
      <label className="text-xs font-medium mb-1 block">Time Period</label>
      <div className="grid grid-cols-3 gap-1 mb-2">
        <Button 
          size="sm"
          variant={timeframe === "week" ? "default" : "outline"}
          className="h-8 text-xs"
          onClick={() => setTimeframe("week")}
        >
          Weekly
        </Button>
        <Button 
          size="sm"
          variant={timeframe === "month" ? "default" : "outline"}
          className="h-8 text-xs"
          onClick={() => setTimeframe("month")}
        >
          Monthly
        </Button>
        <Button 
          size="sm"
          variant={timeframe === "year" ? "default" : "outline"}
          className="h-8 text-xs"
          onClick={() => setTimeframe("year")}
        >
          Yearly
        </Button>
      </div>
    </div>
  );

  // Additional filters for week selection
  const additionalFilters = timeframe === "week" ? (
    <div>
      <label className="text-xs font-medium mb-1 block">Week</label>
      <Select 
        value={selectedWeek} 
        onValueChange={setSelectedWeek}
      >
        <SelectTrigger className="h-8 text-xs">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Select week" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[220px] overflow-y-auto">
          {WEEKS.map((week, index) => (
            <SelectItem key={index} value={week.value}>
              {week.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : null;

  // Use React Query for data fetching with caching
  const { data: dashboardData, isLoading, error } = useDataFetching(
    ['dashboard', timeframe, selectedYear, selectedMonth, selectedWeek],
    () => dashboardAPI.getDashboardOverview(
      timeframe,
      selectedYear,
      selectedMonth,
      timeframe === "week" ? selectedWeek : undefined
    ),
    {
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to fetch dashboard data"
        );
      },
    }
  );

  // Render loading skeletons for sections
  const renderSkeletons = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[350px] rounded-lg" />
        <Skeleton className="h-[350px] rounded-lg" />
      </div>
    </div>
  );

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <div className="w-full">
          <SectionHeader
            title="Dashboard"
            description="Overview of production, sales, and inventory metrics"
          />
        </div>

        <FilterBar
          selectedYear={selectedYear}
          selectedMonth={timeframe !== "year" ? selectedMonth : undefined}
          onYearChange={setSelectedYear}
          onMonthChange={timeframe !== "year" ? setSelectedMonth : undefined}
          customViewingContent={customViewingContent}
          isCustomFilterActive={isCustomFilterActive}
          onResetFilters={handleResetFilters}
          showPrintButton={false}
          filterTitle="Dashboard Filters"
          resetButtonText="Reset All"
          periodTypeSelector={periodTypeSelector}
          additionalFilters={additionalFilters}
        />

        <div className="flex flex-col gap-8">
          {isLoading ? (
            renderSkeletons()
          ) : (
            dashboardData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(dashboardData?.revenue?.totalRevenue || 0)}
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                    description={`Revenue for the selected period`}
                  />
                  <StatsCard
                    title="Total Production"
                    value={dashboardData?.production?.totalQuantity || 0}
                    icon={<Shirt className="h-4 w-4 text-muted-foreground" />}
                    description="Items produced"
                  />
                  <StatsCard
                    title="Total Orders"
                    value={dashboardData?.sales?.totalOrders || 0}
                    icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                    description="Orders completed"
                  />
                  <StatsCard
                    title="Average Order Value"
                    value={formatCurrency(dashboardData?.sales?.averageOrderValue || 0)}
                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                    description="Per order average"
                  />
                </div>

                <CustomTabs 
                  defaultValue="sales"
                  tabs={[
                    { value: "sales", label: "Sales Overview", icon: DollarSign },
                    { value: "production", label: "Production Overview", icon: Shirt },
                    { value: "material", label: "Material Usage", icon: Package }
                  ]}
                >
                  <TabPanel value="sales">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                      <CustomChart
                        title="Monthly Revenue"
                        icon={LineChartIcon}
                        loading={isLoading}
                        data={dashboardData?.revenue?.monthlyRevenue?.map(item => ({
                          name: MONTHS[item.month - 1],
                          value: item.revenue
                        }))}
                        dataKey="value"
                        nameKey="name"
                        valuePrefix="₱"
                        valueLabel="Revenue"
                        nameLabel="Month"
                        initialChartType="bar"
                        hideXAxisText={true}
                      />
                      <CustomChart
                        title="Department Sales Breakdown"
                        icon={PieChartIcon}
                        loading={isLoading}
                        data={dashboardData?.sales?.departmentBreakdown?.map(item => ({
                          name: item.name,
                          value: item.totalSales
                        }))}
                        dataKey="value"
                        nameKey="name"
                        valuePrefix="₱"
                        valueLabel="Sales"
                        nameLabel="Department"
                        initialChartType="bar"
                      />
                    </div>
                  </TabPanel>

                  <TabPanel value="production">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                      <CustomChart
                        title="Production by Product Type"
                        icon={BarChartIcon}
                        loading={isLoading}
                        data={dashboardData?.production?.productTypeBreakdown?.map(item => ({
                          name: item.name,
                          value: item.quantity
                        }))}
                        dataKey="value"
                        nameKey="name"
                        valuePrefix=""
                        valueLabel="Quantity"
                        nameLabel="Product Type"
                        initialChartType="bar"
                      />
                      <CustomChart
                        title="Production by Level"
                        icon={PieChartIcon}
                        loading={isLoading}
                        data={dashboardData?.production?.levelBreakdown?.map(item => ({
                          name: item.name,
                          value: item.quantity
                        }))}
                        dataKey="value"
                        nameKey="name"
                        valuePrefix=""
                        valueLabel="Quantity"
                        nameLabel="Level"
                        initialChartType="pie"
                      />
                    </div>
                  </TabPanel>

                  <TabPanel value="material">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                      <CustomChart
                        title="Uniform Inventory Status"
                        icon={Clipboard}
                        loading={isLoading}
                        data={[
                          { name: 'Available', value: dashboardData?.inventory?.uniform?.status?.available },
                          { name: 'Low Stock', value: dashboardData?.inventory?.uniform?.status?.lowStock },
                          { name: 'Out of Stock', value: dashboardData?.inventory?.uniform?.status?.outOfStock }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        valuePrefix=""
                        valueLabel="Count"
                        nameLabel="Status"
                        initialChartType="pie"
                      />
                      <CustomChart
                        title="Raw Material Inventory Status"
                        icon={Package}
                        loading={isLoading}
                        data={[
                          { name: 'Available', value: dashboardData?.inventory?.rawMaterial?.status?.available },
                          { name: 'Low Stock', value: dashboardData?.inventory?.rawMaterial?.status?.lowStock },
                          { name: 'Out of Stock', value: dashboardData?.inventory?.rawMaterial?.status?.outOfStock }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        valuePrefix=""
                        valueLabel="Count"
                        nameLabel="Status"
                        initialChartType="pie"
                      />
                      <CustomChart
                        title="Uniform Inventory by Level"
                        icon={BarChartIcon}
                        loading={isLoading}
                        data={dashboardData?.inventory?.uniform?.byLevel?.map(item => ({
                          name: item.name,
                          value: item.totalQuantity
                        }))}
                        dataKey="value"
                        nameKey="name"
                        valuePrefix=""
                        valueLabel="Quantity"
                        nameLabel="Level"
                        initialChartType="bar"
                      />
                      <CustomChart
                        title="Raw Material by Category"
                        icon={BarChartIcon}
                        loading={isLoading}
                        data={dashboardData?.inventory?.rawMaterial?.byCategory?.map(item => ({
                          name: item.name,
                          value: item.totalItems
                        }))}
                        dataKey="value"
                        nameKey="name"
                        valuePrefix=""
                        valueLabel="Items"
                        nameLabel="Category"
                        initialChartType="bar"
                      />
                    </div>
                  </TabPanel>
                </CustomTabs>
              </>
            )
          )}
        </div>
      </div>
    </PrivateLayout>
  );
}

