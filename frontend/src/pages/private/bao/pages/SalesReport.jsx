import { useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import { SalesOverviewChart } from "../../joborder/components/charts/SalesOverviewChart.jsx";
import { DepartmentSalesChart } from "../../joborder/components/charts/DepartmentSalesChart.jsx";
import { ProductTypeSalesChart } from "../../joborder/components/charts/ProductTypeSalesChart.jsx";
import { salesReportAPI } from "../../joborder/api/salesReportApi";
import { toast } from "sonner";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { Button } from "@/components/ui/button";
import { FileDown, Package, DollarSign, TrendingUp, CalendarDays, CalendarRange, Clock } from "lucide-react";
import CustomSelect from "@/components/custom-components/CustomSelect";
import StatsCard from "@/components/custom-components/StatsCard";
import { handlePrint, handleYearlyPrint } from "../../joborder/components/print/print";
import { useDataFetching } from "@/hooks/useDataFetching";

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

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: MONTHS[i]
  }));

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
        // Fetch data for the last 5 years
        const currentYear = parseInt(selectedYear);
        const yearPromises = Array.from({ length: 5 }, (_, i) => 
          salesReportAPI.getYearlySalesSummary((currentYear - i).toString())
        );
        
        const yearData = await Promise.all(yearPromises);
        
        // Transform the data to show yearly comparison
        return {
          ...yearData[0], // Use the most recent year's data for other metrics
          monthlyData: yearData.map((year, index) => ({
            month: currentYear - index,
            totalSales: year.totalSales
          })),
          departmentBreakdown: yearData[0].department.map(dept => ({
            name: dept.name,
            totalSales: dept.totalSales,
            orderCount: dept.orderCount
          })),
          productTypeBreakdown: yearData[0].productType.map(product => ({
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

  return (
    <PrivateLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <SectionHeader
            title="BAO Sales Report"
            description="View and analyze BAO sales performance across different metrics"
          />
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Button
              className="w-full md:w-auto flex items-center justify-center"
              onClick={() => handlePrint(salesData, selectedMonth, selectedYear, MONTHS, formatCurrency)}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Print Monthly Report
            </Button>
            <Button
              className="w-full md:w-auto flex items-center justify-center"
              onClick={() => handleYearlyPrint(selectedYear, salesReportAPI, formatCurrency)}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Print Yearly Report
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
              <CustomSelect
                name="year"
                label="Year"
                placeholder="Select year"
                options={years.map(year => ({ value: year, label: year }))}
                value={selectedYear}
                onChange={setSelectedYear}
                icon={CalendarDays}
              />
            </div>
            {timePeriod === "month" && (
              <div className="w-full md:w-1/3">
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
            <div className="w-full md:w-1/3">
              <CustomSelect
                name="timePeriod"
                label="Time Period"
                placeholder="Select time period"
                options={[
                  { value: "month", label: "Monthly" },
                  { value: "year", label: "Yearly" }
                ]}
                value={timePeriod}
                onChange={setTimePeriod}
                icon={Clock}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="Total Orders"
              value={salesData?.totalOrders || 0}
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              description="Orders this period"
            />
            <StatsCard 
              title="Average Order Value"
              value={formatCurrency(salesData?.averageOrderValue)}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              description="Per order average"
            />
            <StatsCard 
              title="Total Revenue"
              value={formatCurrency(salesData?.totalSales)}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              description={`Total sales this ${timePeriod}`}
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
      </div>
    </PrivateLayout>
  );
};

export default SalesReport;
