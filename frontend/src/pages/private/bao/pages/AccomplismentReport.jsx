import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Eye,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { accomplishmentReportAPI } from "../../joborder/api/accomplishmentReportApi";
import { useDataFetching } from "@/hooks/useDataFetching";
import { formatDate } from "@/lib/utils";
import { AccomplishmentReportDetailsDialog } from "../../joborder/components/details/accomplishment-report-details";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeAPI } from "@/lib/api";
import { handlePrintAccomplishmentReport } from "../../joborder/components/print/accomplishment-report-print";
import { Badge } from "@/components/ui/badge";
import FilterBar from "@/components/custom-components/FilterBar";

export default function AccomplismentReport() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Print filters
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedPeriodType, setSelectedPeriodType] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch employees for filter
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeAPI.getActiveEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch reports data
  const { data: reports, isLoading } = useDataFetching(
    ['accomplishmentReports', selectedYear, selectedMonth, selectedPeriodType, selectedEmployee],
    async () => {
      const data = await accomplishmentReportAPI.getAllAccomplishmentReports();
      
      // Filter the data based on selected filters
      return data.filter(report => {
        const reportDate = new Date(report.dateAccomplished);
        const reportYear = reportDate.getFullYear();
        const reportMonth = reportDate.getMonth() + 1;
        
        // Filter by year
        if (reportYear !== parseInt(selectedYear)) {
          return false;
        }
        
        // Filter by month if in month mode
        if (selectedPeriodType === "month" && reportMonth !== parseInt(selectedMonth)) {
          return false;
        }
        
        // Filter by employee if specific employee is selected
        if (selectedEmployee !== "all" && report.assignedEmployee?._id !== selectedEmployee) {
          return false;
        }
        
        return true;
      });
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to fetch reports");
      },
    }
  );

  const columns = [
    {
      key: "reportId",
      header: "Report ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "assignedEmployee",
      header: "Employee",
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value?.name || "-"}</span>
        </div>
      ),
    },
    {
      key: "accomplishmentType",
      header: "Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "dateStarted",
      header: "Date Started",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: "dateAccomplished",
      header: "Date Accomplished",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{formatDate(value)}</span>
        </div>
      ),
    },
  ];

  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
  };

  const handlePrint = async () => {
    try {
      await handlePrintAccomplishmentReport(
        reports,
        selectedEmployee,
        selectedPeriodType,
        parseInt(selectedMonth),
        parseInt(selectedYear),
        MONTHS,
        employees
      );
    } catch (error) {
      toast.error("Failed to generate print preview");
      console.error("Print error:", error);
    }
  };

  const actionCategories = {
    view: {
      label: "View Actions",
      actions: [
        {
          label: "View Details",
          icon: Eye,
          onClick: handleView,
        },
      ],
    },
  };

  // FilterBar with custom viewingLabel and additionalFilters
  const customViewingContent = (
    <div className="flex flex-wrap items-center gap-1">
      <span className="font-medium">Viewing:</span>
      <Badge variant="secondary" className="font-normal">
        {selectedPeriodType === "month"
          ? `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`
          : `Year ${selectedYear}`}
      </Badge>
      <Badge variant={selectedEmployee === "all" ? "outline" : "default"} className="font-normal">
        {selectedEmployee === "all" 
          ? "All Employees" 
          : employees.find(e => e._id === selectedEmployee)?.name || "Unknown"}
      </Badge>
    </div>
  );

  // Period type selector for the top of the filter
  const periodTypeSelector = (
    <div>
      <label className="text-xs font-medium mb-1 block">Period Type</label>
      <div className="flex gap-1 mb-2">
        <Button 
          size="sm"
          variant={selectedPeriodType === "month" ? "default" : "outline"}
          className="flex-1 h-8 text-xs"
          onClick={() => setSelectedPeriodType("month")}
        >
          Monthly
        </Button>
        <Button 
          size="sm"
          variant={selectedPeriodType === "year" ? "default" : "outline"}
          className="flex-1 h-8 text-xs"
          onClick={() => setSelectedPeriodType("year")}
        >
          Yearly
        </Button>
      </div>
    </div>
  );

  // Employee filter
  const additionalFilters = (
    <div>
      <label className="text-xs font-medium mb-1 block">Employee</label>
      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
        <SelectTrigger className="h-8 text-xs">
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Select employee" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[220px] overflow-y-auto">
          <SelectItem value="all">All Employees</SelectItem>
          {employees.map((emp) => (
            <SelectItem key={emp._id} value={emp._id}>
              {emp.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Accomplishment Report Overview"
          description="View employee accomplishments and work progress"
        />

        {/* FilterBar component */}
        <FilterBar
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={selectedPeriodType === "month" ? setSelectedMonth : undefined}
          printTooltip="Print Accomplishment Report"
          onPrintClick={handlePrint}
          isCustomFilterActive={() => (
            selectedEmployee !== "all" || 
            selectedPeriodType !== "month" || 
            selectedMonth !== (new Date().getMonth() + 1).toString() || 
            selectedYear !== new Date().getFullYear().toString()
          )}
          customViewingContent={customViewingContent}
          additionalFilters={additionalFilters}
          periodTypeSelector={periodTypeSelector}
          filterTitle="Report Filters"
          resetButtonText="Reset All"
          onResetFilters={() => {
            setSelectedEmployee("all");
            setSelectedPeriodType("month");
            setSelectedMonth((new Date().getMonth() + 1).toString());
            setSelectedYear(new Date().getFullYear().toString());
          }}
        />

        <DataTable
          data={reports || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
        />

        {/* View Dialog */}
        <AccomplishmentReportDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />
      </div>
    </PrivateLayout>
  );
}