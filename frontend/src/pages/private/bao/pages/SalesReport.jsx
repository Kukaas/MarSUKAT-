import { useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import { SalesOverviewChart } from "../../joborder/components/charts/SalesOverviewChart.jsx";
import { DepartmentSalesChart } from "../../joborder/components/charts/DepartmentSalesChart.jsx";
import { ProductTypeSalesChart } from "../../joborder/components/charts/ProductTypeSalesChart.jsx";
import { salesReportAPI } from "../../joborder/api/salesReportApi";
import { toast } from "sonner";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { 
  Package, 
  DollarSign, 
  TrendingUp,
} from "lucide-react";
import StatsCard from "@/components/custom-components/StatsCard";
import { handlePrint, handleYearlyPrint } from "../../joborder/components/print/print";
import { useDataFetching } from "@/hooks/useDataFetching";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/custom-components/FilterBar";

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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};

const SalesReport = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [timePeriod, setTimePeriod] = useState("month");

  // Use React Query for data fetching with caching
  const { 
    data: salesData, 
    isLoading,
    error: salesError 
  } = useDataFetching(
    ['salesReport', selectedYear, selectedMonth, timePeriod],
    async () => {
      if (timePeriod === "month") {
        const data = await salesReportAPI.getMonthlySalesSummary(selectedYear, selectedMonth);
        return {
          ...data,
          monthlyData: data.monthlyData?.map(item => ({
            month: item.month,
            totalSales: item.sales
          })),
          departmentBreakdown: data.department.map(dept => ({
            name: dept.name,
            totalSales: dept.totalSales,
            orderCount: dept.orderCount
          })),
          productTypeBreakdown: data.productType.map(product => ({
            name: product.name,
            totalSales: product.totalSales,
            quantity: product.quantity
          }))
        };
      } else {
        // Fetch yearly data
        const data = await salesReportAPI.getYearlySalesSummary(selectedYear);
        return {
          ...data,
          monthlyData: data.monthlyData?.map(item => ({
            month: item.month,
            totalSales: item.sales
          })),
          departmentBreakdown: data.department.map(dept => ({
            name: dept.name,
            totalSales: dept.totalSales,
            orderCount: dept.orderCount
          })),
          productTypeBreakdown: data.productType.map(product => ({
            name: product.name,
            totalSales: product.totalSales,
            quantity: product.quantity
          }))
        };
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to fetch sales data");
      },
    }
  );

  const handleMonthlyPrint = () => {
    handlePrint(salesData, selectedMonth, selectedYear, MONTHS, formatCurrency);
  };

  const handleYearlyPrintClick = () => {
    handleYearlyPrint(selectedYear, salesReportAPI, formatCurrency);
  };

  // Check if filters are different from defaults
  const isCustomFilterActive = () => {
    return (
      selectedYear !== new Date().getFullYear().toString() || 
      selectedMonth !== (new Date().getMonth() + 1).toString() ||
      timePeriod !== "month"
    );
  };

  // Custom reset function
  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedMonth((new Date().getMonth() + 1).toString());
    setTimePeriod("month");
  };

  // Period type selector for the top of the filter
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

  // Custom viewing content with period label
  const customViewingContent = (
    <div className="flex flex-wrap items-center gap-1">
      <span className="font-medium">Viewing:</span>
      <Badge variant="secondary" className="font-normal">
        {timePeriod === "month"
          ? `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`
          : `Year ${selectedYear}`}
      </Badge>
    </div>
  );

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="BAO Sales Report"
          description="View and analyze BAO sales performance across different metrics"
        />

        <FilterBar
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={timePeriod === "month" ? setSelectedMonth : undefined}
          printTooltip={`Print ${timePeriod === "month" ? "Monthly" : "Yearly"} Sales Report`}
          onPrintClick={timePeriod === "month" ? handleMonthlyPrint : handleYearlyPrintClick}
          isCustomFilterActive={isCustomFilterActive}
          customViewingContent={customViewingContent}
          periodTypeSelector={periodTypeSelector}
          filterTitle="Report Filters"
          resetButtonText="Reset All"
          onResetFilters={handleResetFilters}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Total Orders"
            value={salesData?.totalOrders || 0}
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
            description="Orders this period"
            isLoading={isLoading}
          />
          <StatsCard 
            title="Average Order Value"
            value={formatCurrency(salesData?.averageOrderValue)}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            description="Per order average"
            isLoading={isLoading}
          />
          <StatsCard 
            title="Total Revenue"
            value={formatCurrency(salesData?.totalSales)}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            description={`Total sales this ${timePeriod}`}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <SalesOverviewChart data={salesData} loading={isLoading} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DepartmentSalesChart data={salesData?.departmentBreakdown} loading={isLoading} />
            <ProductTypeSalesChart data={salesData?.productTypeBreakdown} loading={isLoading} />
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default SalesReport;
