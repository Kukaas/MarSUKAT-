import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Activity,
  PowerOff
} from "lucide-react";
import { useState } from "react";
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
import { toast } from "sonner";
import { EmployeeDetailsDialog } from "../components/details/employee-details";
import EmployeeForm from "../forms/EmployeeForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { employeeAPI } from "@/lib/api";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { StatusConfirmation } from "@/components/custom-components/StatusConfirmation";

const initialFormState = {
  name: "",
  email: "",
  contactNumber: "",
  positions: [],
  municipality: "",
  barangay: "",
};

export default function Employees() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    item: null,
  });

  // Fetch employees data with caching
  const { data: employees, isLoading, refetch: refetchEmployees } = useDataFetching(
    ['employees'],
    async () => {
      const data = await employeeAPI.getAllEmployees();
      // Sort data by createdAt in descending order (newest first)
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  // Create mutation
  const createMutation = useDataMutation(
    ['employees'],
    async (data) => {
      const result = await employeeAPI.createEmployee(data);
      await refetchEmployees();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Employee created successfully");
        setIsCreateDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create employee");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['employees'],
    async (data) => {
      const result = await employeeAPI.updateEmployee(selectedId, data);
      await refetchEmployees();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Employee updated successfully");
        setIsEditDialogOpen(false);
        setSelectedId(null);
        setSelectedItem(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update employee");
      },
    }
  );

  // Status toggle mutation
  const statusMutation = useDataMutation(
    ['employees'],
    async (id) => {
      const item = statusDialog.item;
      const result = await employeeAPI.updateEmployeeStatus(id, {
        isActive: !item.isActive,
      });
      await refetchEmployees();
      return result;
    },
    {
      onSuccess: () => {
        toast.success(
          statusDialog.item?.isActive
            ? "Employee deactivated successfully"
            : "Employee activated successfully"
        );
        setStatusDialog({ isOpen: false, item: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update status");
      },
    }
  );

  // Delete mutation
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });

  const deleteMutation = useDataMutation(
    ['employees'],
    async (id) => {
      const result = await employeeAPI.deleteEmployee(id);
      await refetchEmployees();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Employee deleted successfully");
        setDeleteDialog({ isOpen: false, itemToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete employee");
      },
    }
  );

  // Column definitions
  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "contactNumber",
      header: "Contact",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "municipality",
      header: "Location",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            {value}, {row.barangay}
          </span>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <StatusBadge
          status={value ? "Active" : "Inactive"}
          icon={Activity}
          variant={value ? "success" : "destructive"}
          className="text-xs"
        />
      ),
    },
  ];

  // Action handlers
  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedId(row._id);
    setIsEditDialogOpen(true);
    setSelectedItem(row);
  };

  const handleStatusToggle = (row) => {
    setStatusDialog({
      isOpen: true,
      item: row,
    });
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

  const handleStatusConfirm = async () => {
    if (statusDialog.item) {
      await statusMutation.mutateAsync(statusDialog.item._id);
    }
  };

  const handleStatusCancel = () => {
    if (!statusMutation.isPending) {
      setStatusDialog({ isOpen: false, item: null });
    }
  };

  // Define actions for the data table
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
        {
          label: (row) => (row.isActive ? "Deactivate" : "Activate"),
          icon: PowerOff,
          onClick: handleStatusToggle,
          variant: (row) => (row.isActive ? "destructive" : "default"),
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

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Employee Management"
          description="Manage employees in the system"
        />

        <DataTable
          data={employees || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </div>
          }
        />

        {/* View Dialog */}
        <EmployeeDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px] h-[82vh] sm:h-[90vh] flex flex-col gap-0">
            <AlertDialogHeader  className="flex-none">
              <AlertDialogTitle>
                Create New Employee
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new employee to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="px-1 py-4">
                  <EmployeeForm
                    initialData={initialFormState}
                    onSubmit={createMutation.mutateAsync}
                    isSubmitting={createMutation.isPending}
                  />
                </div>
              </ScrollArea>
            </div>
            <AlertDialogFooter className="flex-none border-t pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !createMutation.isPending && setIsCreateDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="employeeForm"
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
                Edit Employee
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the employee details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <EmployeeForm
                  initialData={selectedItem}
                  isEdit={true}
                  onSubmit={updateMutation.mutateAsync}
                  isSubmitting={updateMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => {
                  if (!updateMutation.isPending) {
                    setIsEditDialogOpen(false);
                    setSelectedItem(null);
                    setSelectedId(null);
                  }
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="employeeForm"
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
          onClose={() => setDeleteDialog({ isOpen: false, itemToDelete: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Employee"
          description={
            deleteDialog.itemToDelete
              ? `Are you sure you want to delete the employee "${deleteDialog.itemToDelete.name}"? This action cannot be undone.`
              : "Are you sure you want to delete this employee? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />

        {/* Status Confirmation Dialog */}
        <StatusConfirmation
          isOpen={statusDialog.isOpen}
          onClose={handleStatusCancel}
          onConfirm={handleStatusConfirm}
          title={`${
            statusDialog.item?.isActive ? "Deactivate" : "Activate"
          } Employee`}
          description={
            statusDialog.item
              ? `Are you sure you want to ${
                  statusDialog.item.isActive ? "deactivate" : "activate"
                } the employee "${statusDialog.item.name}"?`
              : "Are you sure you want to update this employee's status?"
          }
          isUpdating={statusMutation.isPending}
          status={statusDialog.item?.isActive ? "deactivate" : "activate"}
        />
      </div>
    </PrivateLayout>
  );
}
