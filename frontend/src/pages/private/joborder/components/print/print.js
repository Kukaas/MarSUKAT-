import { toast } from "sonner";
import marsuLogo from "@/assets/marsu_logo.jpg";

export const handlePrint = (salesData, selectedMonth, selectedYear, MONTHS, formatCurrency) => {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    const monthlyData = salesData?.monthlyData.find(item => item.month === parseInt(selectedMonth));
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report for ${MONTHS[selectedMonth - 1]} ${selectedYear}</title>
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

export const handleYearlyPrint = async (selectedYear, salesReportAPI, formatCurrency) => {
  try {
    const yearlyData = await salesReportAPI.getYearlySalesSummary(selectedYear);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Yearly Sales Report for ${selectedYear}</title>
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