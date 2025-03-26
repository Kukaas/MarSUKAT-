import { useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { dashboardAPI } from "../api/dashboardApi";
import { toast } from "sonner";
import CustomSelect from "@/components/custom-components/CustomSelect";
import StatsCard from "@/components/custom-components/StatsCard";
import { CustomChart } from "@/components/custom-components/CustomChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { useDataFetching } from "@/hooks/useDataFetching";
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
  Filter,
  Clock,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
} from "lucide-react";

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

export function Dashboard() {
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <CustomSelect
                  name="timeframe"
                  label="Time Period"
                  placeholder="Select time period"
                  options={[
                    { value: "week", label: "Weekly" },
                    { value: "month", label: "Monthly" },
                    { value: "year", label: "Yearly" },
                  ]}
                  value={timeframe}
                  onChange={setTimeframe}
                  icon={Clock}
                />
              </div>
              <div>
                <CustomSelect
                  name="year"
                  label="Year"
                  placeholder="Select year"
                  options={years}
                  value={selectedYear}
                  onChange={setSelectedYear}
                  icon={CalendarDays}
                />
              </div>
              {timeframe !== "year" && (
                <div>
                  <CustomSelect
                    name="month"
                    label="Month"
                    placeholder="Select month"
                    options={months}
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    icon={CalendarRange}
                  />
                </div>
              )}
              {timeframe === "week" && (
                <div>
                  <CustomSelect
                    name="week"
                    label="Week"
                    placeholder="Select week"
                    options={WEEKS}
                    value={selectedWeek}
                    onChange={setSelectedWeek}
                    icon={CalendarCheck}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                  defaultValue="revenue"
                  tabs={[
                    { value: "revenue", label: "Revenue", icon: DollarSign },
                    { value: "production", label: "Production", icon: Shirt },
                    { value: "inventory", label: "Inventory", icon: Package }
                  ]}
                >
                  <TabPanel value="revenue">
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

                  <TabPanel value="inventory">
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

export default Dashboard;
