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
import marsuLogo from "@/assets/marsu_logo.jpg";

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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const monthlyData = salesData?.monthlyData.find(item => item.month === parseInt(selectedMonth));
      printWindow.document.write(`
        <html>
          <head>
            <title>Sales Report</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: {
                                sans: ['Poppins', 'sans-serif'],
                            },
                            colors: {
                                maroon: '#800000',
                            }
                        }
                    }
                };
            </script>
            <style>
              body { font-family: 'Poppins', sans-serif; color: #333; }
              .header { text-align: center; margin-bottom: 20px; }
              .header img { width: 100px; margin: 0 auto 10px; display: block; }
              .header div { font-size: 20px; font-weight: bold; color: #555; }
              .title { font-size: 28px; font-weight: bold; margin-top: 20px; color: #800000; }
              table { width: 100%; margin-top: 20px; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
              th { background-color: #800000; color: #fff; }
              .section-title { font-size: 22px; font-weight: bold; margin-top: 30px; color: #800000; }
            </style>
          </head>
          <body class="p-8">
            <div class="header">
              <img src="${marsuLogo}" alt="Marinduque State University" />
              <div>Republic of the Philippines</div>
              <div>Marinduque State University</div>
              <div>Panfilio M. Manguera Sr. Road, Tanza, Boac, Marinduque</div>
              <div class="title">Sales Report for ${MONTHS[selectedMonth - 1]} ${selectedYear}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Sales</td>
                  <td>${formatCurrency(monthlyData?.totalSales)}</td>
                </tr>
                <tr>
                  <td>Total Orders</td>
                  <td>${salesData?.totalOrders || 0}</td>
                </tr>
                <tr>
                  <td>Average Order Value</td>
                  <td>${formatCurrency(salesData?.averageOrderValue)}</td>
                </tr>
              </tbody>
            </table>
            <div class="section-title">Department Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Sales</th>
                  <th>Order Count</th>
                </tr>
              </thead>
              <tbody>
                ${salesData?.departmentBreakdown.map(dept => `
                  <tr>
                    <td>${dept.name}</td>
                    <td>${formatCurrency(dept.totalSales)}</td>
                    <td>${dept.orderCount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="section-title">Product Type Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Product Type</th>
                  <th>Total Sales</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${salesData?.productTypeBreakdown.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${formatCurrency(product.totalSales)}</td>
                    <td>${product.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      toast.error("Failed to open print window.");
    }
  };

  const handleYearlyPrint = async () => {
    try {
      const yearlyData = await salesReportAPI.getYearlySalesSummary(selectedYear);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Yearly Sales Report</title>
              <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                  tailwind.config = {
                      theme: {
                          extend: {
                              fontFamily: {
                                  sans: ['Poppins', 'sans-serif'],
                              },
                              colors: {
                                  maroon: '#800000',
                              }
                          }
                      }
                  };
              </script>
              <style>
                body { font-family: 'Poppins', sans-serif; color: #333; }
                .header { text-align: center; margin-bottom: 20px; }
                .header img { width: 100px; margin: 0 auto 10px; display: block; }
                .header div { font-size: 20px; font-weight: bold; color: #555; }
                .title { font-size: 28px; font-weight: bold; margin-top: 20px; color: #800000; }
                table { width: 100%; margin-top: 20px; border-collapse: collapse; }
                th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
                th { background-color: #800000; color: #fff; }
                .section-title { font-size: 22px; font-weight: bold; margin-top: 30px; color: #800000; }
              </style>
            </head>
            <body class="p-8">
              <div class="header">
                <img src="${marsuLogo}" alt="Marinduque State University" />
                <div>Republic of the Philippines</div>
                <div>Marinduque State University</div>
                <div>Panfilio M. Manguera Sr. Road, Tanza, Boac, Marinduque</div>
                <div class="title">Yearly Sales Report for ${selectedYear}</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Sales</td>
                    <td>${formatCurrency(yearlyData.totalSales)}</td>
                  </tr>
                  <tr>
                    <td>Total Orders</td>
                    <td>${yearlyData.totalOrders || 0}</td>
                  </tr>
                  <tr>
                    <td>Average Order Value</td>
                    <td>${formatCurrency(yearlyData.averageOrderValue)}</td>
                  </tr>
                </tbody>
              </table>
              <div class="section-title">Department Breakdown</div>
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Sales</th>
                    <th>Order Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${yearlyData.department.map(dept => `
                    <tr>
                      <td>${dept.name}</td>
                      <td>${formatCurrency(dept.totalSales)}</td>
                      <td>${dept.orderCount}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="section-title">Product Type Breakdown</div>
              <table>
                <thead>
                  <tr>
                    <th>Product Type</th>
                    <th>Total Sales</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${yearlyData.productType.map(product => `
                    <tr>
                      <td>${product.name}</td>
                      <td>${formatCurrency(product.totalSales)}</td>
                      <td>${product.quantity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      } else {
        toast.error("Failed to open print window.");
      }
    } catch (error) {
      toast.error("Failed to fetch yearly sales data");
    }
  };

  return (
    <PrivateLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <SectionHeader
            title="Sales Report"
            description="View and analyze sales performance across different metrics"
          />
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Button
              className="w-full md:w-auto flex items-center justify-center"
              onClick={handlePrint}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Print Monthly Report
            </Button>
            <Button
              className="w-full md:w-auto flex items-center justify-center"
              onClick={handleYearlyPrint}
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
