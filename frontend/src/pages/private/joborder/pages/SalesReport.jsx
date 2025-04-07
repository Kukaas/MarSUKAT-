import { useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import { SalesOverviewChart } from "../components/charts/SalesOverviewChart.jsx";
import { DepartmentSalesChart } from "../components/charts/DepartmentSalesChart.jsx";
import { ProductTypeSalesChart } from "../components/charts/ProductTypeSalesChart.jsx";
import { salesReportAPI } from "../api/salesReportApi";
import { toast } from "sonner";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { Button } from "@/components/ui/button";
import { 
  FileDown, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CalendarDays, 
  CalendarRange, 
  Clock, 
  Filter,
  Printer,
} from "lucide-react";
import StatsCard from "@/components/custom-components/StatsCard";
import { handlePrint, handleYearlyPrint } from "../components/print/print";
import { useDataFetching } from "@/hooks/useDataFetching";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const SalesReport = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [timePeriod, setTimePeriod] = useState("month");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: MONTHS[i]
  }));

  // Fetch sales data with caching
  const { data: salesData, isLoading } = useDataFetching(
    ['salesData', selectedYear, selectedMonth, timePeriod],
    async () => {
      let data;
      if (timePeriod === "month") {
        data = await salesReportAPI.getMonthlySalesSummary(selectedYear, selectedMonth);
      } else {
        data = await salesReportAPI.getYearlySalesSummary(selectedYear);
      }

      if (!data) {
        toast.error("No data available for the selected period");
        return null;
      }

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
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  const handleMonthlyPrint = () => {
    handlePrint(salesData, selectedMonth, selectedYear, MONTHS, formatCurrency);
  };

  const handleYearlyPrintClick = () => {
    handleYearlyPrint(selectedYear, salesReportAPI, formatCurrency);
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Sales Report"
          description="View and analyze sales performance across different metrics"
        />

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-medium">Viewing:</span>
                <Badge variant="secondary" className="font-normal">
                  {timePeriod === "month"
                    ? `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`
                    : `Year ${selectedYear}`}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 gap-1 px-3 text-sm font-normal"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                  {(selectedYear !== new Date().getFullYear().toString() || 
                    selectedMonth !== (new Date().getMonth() + 1).toString() ||
                    timePeriod !== "month") && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">
                      •
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Report Filters</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setSelectedYear(new Date().getFullYear().toString());
                        setSelectedMonth((new Date().getMonth() + 1).toString());
                        setTimePeriod("month");
                      }}
                    >
                      Reset All
                    </Button>
                  </div>
                  
                  {/* Period Type First */}
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
                  
                  {/* Time Period Selection */}
                  <div className="space-y-3">
                    {timePeriod === "month" && (
                      <div>
                        <label className="text-xs font-medium mb-1 block">Month</label>
                        <Select 
                          value={selectedMonth} 
                          onValueChange={setSelectedMonth}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-3 w-3 text-muted-foreground" />
                              <SelectValue placeholder="Select month" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-xs font-medium mb-1 block">Year</label>
                      <Select 
                        value={selectedYear} 
                        onValueChange={setSelectedYear}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <div className="flex items-center gap-2">
                            <CalendarRange className="h-3 w-3 text-muted-foreground" />
                            <SelectValue placeholder="Select year" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="button" 
                      size="sm"
                      className="w-full h-8"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={timePeriod === "month" ? handleMonthlyPrint : handleYearlyPrintClick}
                    disabled={isLoading}
                    className="h-9 gap-1 px-3 text-sm font-normal"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print {timePeriod === "month" ? "Monthly" : "Yearly"} Sales Report</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

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
}
