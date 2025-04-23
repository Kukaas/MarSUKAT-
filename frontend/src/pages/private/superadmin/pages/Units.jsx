import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Eye, Edit2, Trash2, Box } from "lucide-react";
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
import { UnitDetailsDialog } from "../components/details/unit-details";
import { UnitForm } from "../forms/UnitForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

export default function Units() {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    unit: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    unitToDelete: null,
  });

  // Fetch units data with caching
  const { data: units, isLoading, refetch: refetchUnits } = useDataFetching(
    ['units'],
    async () => {
      const data = await systemMaintenanceAPI.getAllUnits();
      // Sort data by createdAt in descending order (newest first)
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  // Create mutation
  const createMutation = useDataMutation(
    ['units'],
    async (data) => {
      const result = await systemMaintenanceAPI.createUnit(data);
      await refetchUnits();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Unit created successfully");
        setIsCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create unit");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['units'],
    async (data) => {
      const result = await systemMaintenanceAPI.updateUnit(selectedId, data);
      await refetchUnits();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Unit updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update unit");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['units'],
    async (id) => {
      const result = await systemMaintenanceAPI.deleteUnit(id);
      await refetchUnits();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Unit deleted successfully");
        setDeleteDialog({ isOpen: false, unitToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete unit");
      },
    }
  );

  // Column definitions
  const columns = [
    {
      key: "unitId",
      header: "Unit ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "unit",
      header: "Unit",
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (value) => (
        <span>
          {new Date(value).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  // Action handlers
  const handleView = (row) => {
    setSelectedUnit(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      unit: row.unit,
      unitId: row.unitId,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      unitToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.unitToDelete) {
      await deleteMutation.mutateAsync(deleteDialog.unitToDelete._id);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteMutation.isPending) {
      setDeleteDialog({ isOpen: false, unitToDelete: null });
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
      setFormData({ unit: "" });
      setSelectedId(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Clean up function for dialog close
  const handleDialogClose = (type) => {
    if (type === "edit") {
      setIsEditDialogOpen(false);
      setIsEditing(false);
      setSelectedId(null);
    } else if (type === "create") {
      setIsCreateDialogOpen(false);
    }
    setFormData({ unit: "" });
  };

  // Define actions for the units
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

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Unit Management"
          description="Manage units in the system"
        />

        <DataTable
          data={units || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({ unit: "" });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Unit</span>
            </div>
          }
        />

        {/* View Dialog */}
        <UnitDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          unit={selectedUnit}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Unit
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new unit to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <UnitForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
              />
            </div>
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
                form="unitForm"
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
                Edit Unit
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the unit details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <UnitForm
                formData={formData}
                setFormData={setFormData}
                isEdit={true}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
              />
            </div>
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
                form="unitForm"
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
          title="Delete Unit"
          description={
            deleteDialog.unitToDelete
              ? `Are you sure you want to delete the unit "${deleteDialog.unitToDelete.unit}"? This action cannot be undone.`
              : "Are you sure you want to delete this unit? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PrivateLayout>
  );
}
