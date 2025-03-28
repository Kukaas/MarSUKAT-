import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Building2,
  X,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
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
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { DepartmentLevelForm } from "../forms/DepartmentLevelForm";
import { DepartmentLevelDetailsDialog } from "../components/details/department-level-details";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

export default function DepartmentLevelOptions() {
  const { user } = useAuth();
  const [selectedDepartmentLevel, setSelectedDepartmentLevel] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });

  // Fetch department levels data with caching
  const { data: departmentLevels, isLoading, refetch: refetchDepartmentLevels } = useDataFetching(
    ['departmentLevels'],
    async () => {
      const data = await systemMaintenanceAPI.getAllDepartmentLevels();
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  // Create mutation
  const createMutation = useDataMutation(
    ['departmentLevels'],
    async (data) => {
      const result = await systemMaintenanceAPI.createDepartmentLevel(data);
      await refetchDepartmentLevels();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Department level combination created successfully");
        setIsCreateDialogOpen(false);
        setSelectedDepartmentLevel(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create department level combination");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['departmentLevels'],
    async (data) => {
      const result = await systemMaintenanceAPI.updateDepartmentLevel(
        selectedDepartmentLevel._id,
        data
      );
      await refetchDepartmentLevels();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Department level combination updated successfully");
        setIsEditDialogOpen(false);
        setSelectedDepartmentLevel(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update department level combination");
      },
    }
  );

  // Status toggle mutation
  const statusToggleMutation = useDataMutation(
    ['departmentLevels'],
    async (id) => {
      const result = await systemMaintenanceAPI.updateDepartmentLevelStatus(id, {
        isActive: !selectedDepartmentLevel.isActive,
      });
      await refetchDepartmentLevels();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Status updated successfully");
      },
      onError: (error) => {
        toast.error("Failed to update status");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['departmentLevels'],
    async (id) => {
      const result = await systemMaintenanceAPI.deleteDepartmentLevel(id);
      await refetchDepartmentLevels();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Department level combination deleted successfully");
        setDeleteDialog({ isOpen: false, itemToDelete: null });
      },
      onError: (error) => {
        toast.error("Failed to delete department level combination");
      },
    }
  );

  // Column definitions
  const columns = [
    {
      key: "departmentLevelId",
      header: "ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <span className={value ? "text-green-600" : "text-red-600"}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // Action handlers
  const handleView = (row) => {
    setSelectedDepartmentLevel(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedDepartmentLevel(row);
    setIsEditDialogOpen(true);
  };

  const handleStatusToggle = async (row) => {
    setSelectedDepartmentLevel(row);
    await statusToggleMutation.mutateAsync(row._id);
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

  const handleSubmit = async (data) => {
    try {
      if (isEditDialogOpen) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
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
          label: "Toggle Status",
          icon: Eye,
          onClick: handleStatusToggle,
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
          title="Department Level Management"
          description="Manage department and level combinations in the system"
        />

        <DataTable
          data={departmentLevels || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Combination</span>
            </div>
          }
        />

        {/* View Dialog */}
        <DepartmentLevelDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          departmentLevel={selectedDepartmentLevel}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Department Level Combination
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new department and level combination to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <DepartmentLevelForm
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
              />
            </div>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !createMutation.isPending && setIsCreateDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="departmentLevelForm"
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
                Edit Department Level Combination
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the department and level combination
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <DepartmentLevelForm
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
                defaultValues={selectedDepartmentLevel}
              />
            </div>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => {
                  if (!updateMutation.isPending) {
                    setIsEditDialogOpen(false);
                    setSelectedDepartmentLevel(null);
                  }
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="departmentLevelForm"
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
          title="Delete Department Level Combination"
          description={
            deleteDialog.itemToDelete
              ? `Are you sure you want to delete the combination of "${deleteDialog.itemToDelete.department}" department and "${deleteDialog.itemToDelete.level}" level? This action cannot be undone.`
              : "Are you sure you want to delete this combination? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PrivateLayout>
  );
}
