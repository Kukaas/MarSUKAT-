import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Printer,
  Filter,
  ChevronDown,
  CalendarRange,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AccomplishmentReportForm } from "../forms/AccomplishmentReportForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { accomplishmentReportAPI } from "../api/accomplishmentReportApi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";
import { formatDate } from "@/lib/utils";
import { AccomplishmentReportDetailsDialog } from "../components/details/accomplishment-report-details";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { employeeAPI } from "@/lib/api";
import { handlePrintAccomplishmentReport } from "../components/print/accomplishment-report-print";
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
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import FilterBar from "@/components/custom-components/FilterBar";

export const AccomplishmentReport = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    assignedEmployee: "",
    accomplishmentType: "",
    accomplishment: "",
    dateStarted: "",
    dateAccomplished: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  
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
  const { data: reports, isLoading, refetch: refetchReports } = useDataFetching(
    ['accomplishmentReports'],
    async () => {
      const data = await accomplishmentReportAPI.getAllAccomplishmentReports();
      // Sort data by dateAccomplished in descending order (newest first)
      return data.sort((a, b) => new Date(b.dateAccomplished) - new Date(a.dateAccomplished));
    }
  );

  // Create mutation
  const createMutation = useDataMutation(
    ['accomplishmentReports'],
    async (data) => {
      const result = await accomplishmentReportAPI.createAccomplishmentReport(data);
      await refetchReports();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Accomplishment report created successfully");
        setIsCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create report");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['accomplishmentReports'],
    async (data) => {
      const result = await accomplishmentReportAPI.updateAccomplishmentReport(selectedId, data);
      await refetchReports();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Accomplishment report updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update report");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['accomplishmentReports'],
    async (id) => {
      const result = await accomplishmentReportAPI.deleteAccomplishmentReport(id);
      await refetchReports();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Accomplishment report deleted successfully");
        setDeleteDialog({ isOpen: false, itemToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete report");
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

  const handleEdit = (row) => {
    setFormData({
      assignedEmployee: row.assignedEmployee._id,
      accomplishmentType: row.accomplishmentType,
      accomplishment: row.accomplishment,
      dateStarted: new Date(row.dateStarted).toISOString().split('T')[0],
      dateAccomplished: new Date(row.dateAccomplished).toISOString().split('T')[0],
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      itemToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.itemToDelete) {
      await deleteMutation.mutateAsync(deleteDialog.itemToDelete._id);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteMutation.isPending) {
      setDeleteDialog({ isOpen: false, itemToDelete: null });
    }
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

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsEditing(false);
      setFormData({
        assignedEmployee: "",
        accomplishmentType: "",
        accomplishment: "",
        dateStarted: "",
        dateAccomplished: "",
      });
      setSelectedId(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDialogClose = (type) => {
    if (type === "edit") {
      setIsEditDialogOpen(false);
      setIsEditing(false);
      setSelectedId(null);
    } else if (type === "create") {
      setIsCreateDialogOpen(false);
    }
    setFormData({
      assignedEmployee: "",
      accomplishmentType: "",
      accomplishment: "",
      dateStarted: "",
      dateAccomplished: "",
    });
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
    edit: {
      label: "Edit Actions",
      actions: [
        {
          label: "Edit",
          icon: Edit2,
          onClick: handleEdit,
        },
      ],
    },
    delete: {
      label: "Delete Actions",
      actions: [
        {
          label: "Delete",
          icon: Trash2,
          onClick: handleDeleteClick,
          variant: "destructive",
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
          title="Accomplishment Report Management"
          description="Track and manage employee accomplishments and work progress"
        />

        {/* FilterBar component replacing Actions Bar */}
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
          onCreateNew={() => {
            setFormData({
              assignedEmployee: "",
              accomplishmentType: "",
              accomplishment: "",
              dateStarted: "",
              dateAccomplished: "",
            });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Accomplishment Report</span>
            </div>
          }
        />

        {/* View Dialog */}
        <AccomplishmentReportDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Accomplishment Report
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new accomplishment report for an employee
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[200px] pr-4">
              <div className="py-2">
                <AccomplishmentReportForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={createMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !createMutation.isPending && handleDialogClose("create")}
                disabled={createMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="accomplishmentReportForm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <AlertDialog open={isEditDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Edit Accomplishment Report
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the accomplishment report details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[200px] pr-4">
              <div className="py-2">
                <AccomplishmentReportForm
                  formData={formData}
                  setFormData={setFormData}
                  isEdit={true}
                  onSubmit={handleSubmit}
                  isSubmitting={updateMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !updateMutation.isPending && handleDialogClose("edit")}
                disabled={updateMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="accomplishmentReportForm"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Accomplishment Report"
          description={
            deleteDialog.itemToDelete
              ? `Are you sure you want to delete the accomplishment report for ${deleteDialog.itemToDelete.assignedEmployee?.name || "this employee"}? This action cannot be undone.`
              : "Are you sure you want to delete this accomplishment report? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PrivateLayout>
  );
};
