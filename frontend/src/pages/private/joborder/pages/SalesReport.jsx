import { useEffect, useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import { SalesOverviewChart } from "../components/charts/SalesOverviewChart.jsx";
import { DepartmentSalesChart } from "../components/charts/DepartmentSalesChart.jsx";
import { ProductTypeSalesChart } from "../components/charts/ProductTypeSalesChart.jsx";
import { salesReportAPI } from "../api/salesReportApi";
import { toast } from "sonner";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Package, DollarSign, TrendingUp } from "lucide-react";
import CustomSelect from "@/components/custom-components/CustomSelect";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: MONTHS[i]
  }));

  const fetchSalesData = async (year, month) => {
    try {
      setLoading(true);
      const data = await salesReportAPI.getMonthlySalesSummary(year, month);
      
      if (!data) {
        toast.error("No data available for the selected period");
        return;
      }

      const transformedData = {
        ...data,
        monthlyData: data.monthlyData.map(item => ({
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

      setSalesData(transformedData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch sales data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  return (
    <PrivateLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <SectionHeader
            title="Sales Report"
            description="View and analyze sales performance across different metrics"
          />
          <Button
            className="w-full md:w-auto"
            onClick={() => {
              toast.info("Export functionality coming soon!");
            }}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Report
          </Button>
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
              />
            </div>
            <div className="w-full md:w-1/3">
              <CustomSelect
                name="month"
                label="Month"
                placeholder="Select month"
                options={months}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {salesData?.totalOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Orders this period</p>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {formatCurrency(salesData?.averageOrderValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per order average</p>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {formatCurrency(salesData?.totalSales)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total sales this period</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <SalesOverviewChart data={salesData} loading={loading} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DepartmentSalesChart data={salesData?.departmentBreakdown} loading={loading} />
              <ProductTypeSalesChart data={salesData?.productTypeBreakdown} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
