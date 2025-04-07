import { toast } from "sonner";
import marsuLogo from "@/assets/marsu_logo.jpg";
import { accomplishmentReportAPI } from "../../api/accomplishmentReportApi";
import { formatDate } from "@/lib/utils";

// Custom date formatter that removes the time portion
const formatDateOnly = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Filter reports by employee ID and date criteria
const filterReports = (reports, employeeId, periodType, month, year) => {
  if (!reports || !Array.isArray(reports)) return [];

  return reports.filter(report => {
    const reportDate = new Date(report.dateAccomplished);
    const reportYear = reportDate.getFullYear();
    const reportMonth = reportDate.getMonth() + 1;
    
    // Employee filter
    const employeeMatch = employeeId === "all" || report.assignedEmployee._id === employeeId;
    
    // Date filter
    if (periodType === "month") {
      return employeeMatch && reportYear === year && reportMonth === parseInt(month);
    } else {
      return employeeMatch && reportYear === year;
    }
  });
};

// Group reports by accomplishment type
const groupByAccomplishmentType = (reports) => {
  const groupedReports = {};
  
  reports.forEach(report => {
    const type = report.accomplishmentType;
    if (!groupedReports[type]) {
      groupedReports[type] = [];
    }
    groupedReports[type].push(report);
  });
  
  return Object.entries(groupedReports).map(([type, reports]) => ({
    type,
    count: reports.length,
    reports
  }));
};

// Group reports by employee
const groupByEmployee = (reports) => {
  const groupedReports = {};
  
  reports.forEach(report => {
    const employeeId = report.assignedEmployee._id;
    const employeeName = report.assignedEmployee.name;
    
    if (!groupedReports[employeeId]) {
      groupedReports[employeeId] = {
        employeeId,
        name: employeeName,
        reports: []
      };
    }
    
    groupedReports[employeeId].reports.push(report);
  });
  
  return Object.values(groupedReports).map(group => ({
    ...group,
    count: group.reports.length
  }));
};

export const handlePrintAccomplishmentReport = async (
  reports,
  selectedEmployee,
  selectedPeriodType,
  selectedMonth,
  selectedYear,
  MONTHS,
  employees
) => {
  try {
    let filteredReports = [];
    
    // If no reports provided or empty, fetch them using the right API endpoint
    if (!reports || reports.length === 0) {
      if (selectedEmployee === "all") {
        if (selectedPeriodType === "month") {
          filteredReports = await accomplishmentReportAPI.getReportsByMonth(selectedMonth, selectedYear);
        } else {
          filteredReports = await accomplishmentReportAPI.getReportsByYear(selectedYear);
        }
      } else {
        if (selectedPeriodType === "month") {
          filteredReports = await accomplishmentReportAPI.getReportsByEmployeeAndMonth(
            selectedEmployee, 
            selectedMonth, 
            selectedYear
          );
        } else {
          filteredReports = await accomplishmentReportAPI.getReportsByEmployeeAndYear(
            selectedEmployee, 
            selectedYear
          );
        }
      }
    } else {
      // Filter existing reports based on criteria
      filteredReports = filterReports(
        reports,
        selectedEmployee,
        selectedPeriodType,
        selectedMonth,
        selectedYear
      );
    }
    
    if (filteredReports.length === 0) {
      toast.error("No reports found for the selected criteria");
      return;
    }
    
    // Get groupings
    const reportsByType = groupByAccomplishmentType(filteredReports);
    const reportsByEmployee = selectedEmployee === "all" 
      ? groupByEmployee(filteredReports) 
      : [];

    // Find employee name if specific employee selected
    let selectedEmployeeName = "All Employees";
    if (selectedEmployee !== "all") {
      const employee = employees.find(emp => emp._id === selectedEmployee);
      selectedEmployeeName = employee ? employee.name : "Unknown Employee";
    }
    
    // Determine period text
    const periodText = selectedPeriodType === "month" 
      ? `${MONTHS[selectedMonth - 1]} ${selectedYear}`
      : `Year ${selectedYear}`;
    
    // Create print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Accomplishment Report - ${periodText}</title>
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
              .employee-title { font-size: 18px; font-weight: bold; margin-top: 20px; color: #555; background-color: #f5f5f5; padding: 10px; border-radius: 4px; }
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
              <div class="title">Accomplishment Report</div>
              <div class="subtitle">${selectedEmployee === "all" ? "All Employees" : selectedEmployeeName} - ${periodText}</div>
            </div>

            <div class="summary-box">
              <div class="summary-item">
                <div class="summary-value">${filteredReports.length}</div>
                <div class="summary-label">Total Reports</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${reportsByType.length}</div>
                <div class="summary-label">Task Types</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${selectedEmployee === "all" ? reportsByEmployee.length : 1}</div>
                <div class="summary-label">Employees</div>
              </div>
            </div>

            ${selectedEmployee === "all" ? `
              <div class="section-title">Employee Summary</div>
              <table>
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Reports Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportsByEmployee.map(employee => `
                    <tr>
                      <td>${employee.name}</td>
                      <td>${employee.count}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            <div class="section-title">Accomplishment Types</div>
            <table>
              <thead>
                <tr>
                  <th>Task Type</th>
                  <th>Reports Count</th>
                </tr>
              </thead>
              <tbody>
                ${reportsByType.map(type => `
                  <tr>
                    <td>${type.type}</td>
                    <td>${type.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="section-title">Detailed Reports</div>
            ${selectedEmployee === "all" ? 
              // Group by employee for "all employees" view
              reportsByEmployee.map(employee => `
                <div class="employee-title">${employee.name}</div>
                <table>
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Task Type</th>
                      <th>Date Started</th>
                      <th>Date Accomplished</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${employee.reports.map(report => `
                      <tr>
                        <td>${report.reportId}</td>
                        <td>${report.accomplishmentType}</td>
                        <td>${formatDateOnly(report.dateStarted)}</td>
                        <td>${formatDateOnly(report.dateAccomplished)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `).join('') 
              : 
              // Single employee view
              `<table>
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Task Type</th>
                    <th>Date Started</th>
                    <th>Date Accomplished</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredReports.map(report => `
                    <tr>
                      <td>${report.reportId}</td>
                      <td>${report.accomplishmentType}</td>
                      <td>${formatDateOnly(report.dateStarted)}</td>
                      <td>${formatDateOnly(report.dateAccomplished)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`
            }

            <div class="mt-8 text-center text-sm text-gray-500">
              <p>Generated on ${new Date().toLocaleDateString()}</p>
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
    console.error("Error printing accomplishment report:", error);
    toast.error("Failed to generate print preview");
  }
}; 