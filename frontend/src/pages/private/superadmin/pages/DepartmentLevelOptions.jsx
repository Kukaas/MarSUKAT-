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
import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { DepartmentLevelForm } from "../forms/DepartmentLevelForm";
import { DepartmentLevelDetails } from "../components/department-level-details";

export default function DepartmentLevelOptions() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [departmentLevels, setDepartmentLevels] = useState([]);
  const [selectedDepartmentLevel, setSelectedDepartmentLevel] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch department levels data
  const fetchDepartmentLevels = async () => {
    try {
      setIsLoading(true);
      const data = await systemMaintenanceAPI.getAllDepartmentLevels();
      setDepartmentLevels(data);
    } catch (error) {
      toast.error("Failed to fetch department levels");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentLevels();
  }, []);

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
    try {
      await systemMaintenanceAPI.updateDepartmentLevelStatus(row._id, {
        isActive: !row.isActive,
      });
      await fetchDepartmentLevels();
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      itemToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await systemMaintenanceAPI.deleteDepartmentLevel(
        deleteDialog.itemToDelete._id
      );
      await fetchDepartmentLevels();
      toast.success("Department level combination deleted successfully");
      setDeleteDialog({ isOpen: false, itemToDelete: null });
    } catch (error) {
      toast.error("Failed to delete department level combination");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditDialogOpen) {
        await systemMaintenanceAPI.updateDepartmentLevel(
          selectedDepartmentLevel._id,
          data
        );
        toast.success("Department level combination updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await systemMaintenanceAPI.createDepartmentLevel(data);
        toast.success("Department level combination created successfully");
        setIsCreateDialogOpen(false);
      }
      fetchDepartmentLevels();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save department level combination"
      );
    } finally {
      setIsSubmitting(false);
      setSelectedDepartmentLevel(null);
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
          data={departmentLevels}
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
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-semibold">
                    Department Level Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-500">
                    View comprehensive information about this combination
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="py-2">
              {selectedDepartmentLevel && (
                <DepartmentLevelDetails
                  departmentLevel={selectedDepartmentLevel}
                />
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                isSubmitting={isSubmitting}
              />
            </div>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !isSubmitting && setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="departmentLevelForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
                isSubmitting={isSubmitting}
                defaultValues={selectedDepartmentLevel}
              />
            </div>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    setIsEditDialogOpen(false);
                    setSelectedDepartmentLevel(null);
                  }
                }}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="departmentLevelForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
          isDeleting={isDeleting}
        />
      </div>
    </PrivateLayout>
  );
}
