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
            .subtitle { font-size: 20px; font-weight: bold; margin-top: 10px; color: #555; }
            table { width: 100%; margin-top: 20px; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
            th { background-color: #800000; color: #fff; }
            .section-title { font-size: 22px; font-weight: bold; margin-top: 30px; color: #800000; }
            .summary-box { 
              background-color: #f9f9f9; 
              border: 1px solid #ddd; 
              border-radius: 8px; 
              padding: 15px; 
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
            }
            .summary-item {
              text-align: center;
              flex: 1;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
              color: #800000;
            }
            .summary-label {
              font-size: 14px;
              color: #555;
            }
            @media print {
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body class="p-8">
          <div class="header">
            <img src="${marsuLogo}" alt="Marinduque State University" />
            <div>Republic of the Philippines</div>
            <div>Marinduque State University</div>
            <div>Panfilio M. Manguera Sr. Road, Tanza, Boac, Marinduque</div>
            <div class="title">Sales Report</div>
            <div class="subtitle">${MONTHS[selectedMonth - 1]} ${selectedYear}</div>
          </div>
          
          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(monthlyData?.totalSales || 0)}</div>
              <div class="summary-label">Total Sales</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${salesData?.totalOrders || 0}</div>
              <div class="summary-label">Total Orders</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(salesData?.averageOrderValue || 0)}</div>
              <div class="summary-label">Average Order Value</div>
            </div>
          </div>

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
          
          <div class="mt-8 text-center text-sm text-gray-500">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>MarSUKAT - Marinduque State University</p>
          </div>
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
              .subtitle { font-size: 20px; font-weight: bold; margin-top: 10px; color: #555; }
              table { width: 100%; margin-top: 20px; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
              th { background-color: #800000; color: #fff; }
              .section-title { font-size: 22px; font-weight: bold; margin-top: 30px; color: #800000; }
              .summary-box { 
                background-color: #f9f9f9; 
                border: 1px solid #ddd; 
                border-radius: 8px; 
                padding: 15px; 
                margin-top: 20px;
                display: flex;
                justify-content: space-between;
              }
              .summary-item {
                text-align: center;
                flex: 1;
              }
              .summary-value {
                font-size: 24px;
                font-weight: bold;
                color: #800000;
              }
              .summary-label {
                font-size: 14px;
                color: #555;
              }
              @media print {
                .page-break { page-break-after: always; }
              }
            </style>
          </head>
          <body class="p-8">
            <div class="header">
              <img src="${marsuLogo}" alt="Marinduque State University" />
              <div>Republic of the Philippines</div>
              <div>Marinduque State University</div>
              <div>Panfilio M. Manguera Sr. Road, Tanza, Boac, Marinduque</div>
              <div class="title">Yearly Sales Report</div>
              <div class="subtitle">${selectedYear}</div>
            </div>
            
            <div class="summary-box">
              <div class="summary-item">
                <div class="summary-value">${formatCurrency(yearlyData.totalSales || 0)}</div>
                <div class="summary-label">Total Sales</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${yearlyData.totalOrders || 0}</div>
                <div class="summary-label">Total Orders</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${formatCurrency(yearlyData.averageOrderValue || 0)}</div>
                <div class="summary-label">Average Order Value</div>
              </div>
            </div>

            <div class="section-title">Summary</div>
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
                  <td>${formatCurrency(yearlyData.totalSales || 0)}</td>
                </tr>
                <tr>
                  <td>Total Orders</td>
                  <td>${yearlyData.totalOrders || 0}</td>
                </tr>
                <tr>
                  <td>Average Order Value</td>
                  <td>${formatCurrency(yearlyData.averageOrderValue || 0)}</td>
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
            
            <div class="mt-8 text-center text-sm text-gray-500">
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p>MarSUKAT - Marinduque State University</p>
            </div>
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