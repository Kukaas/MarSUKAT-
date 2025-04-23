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
import { AcademicGownTypeDetailsDialog } from "../components/details/academic-gown-type-details";
import { AcademicGownTypeForm } from "../forms/AcademicGownTypeForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

export default function AcademicGownTypes() {
  const { user } = useAuth();
  const [selectedGownType, setSelectedGownType] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    level: "",
    productType: "",
    size: "",
    rawMaterialsUsed: [{ category: "", type: "", quantity: "", unit: "" }],
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    gownTypeToDelete: null,
  });

  // Fetch academic gown types data with caching
  const { data: gownTypes, isLoading, refetch: refetchGownTypes } = useDataFetching(
    ['academicGownTypes'],
    async () => {
      const data = await systemMaintenanceAPI.getAllAcademicGownTypes();
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
    ['academicGownTypes'],
    async (data) => {
      const result = await systemMaintenanceAPI.createAcademicGownType(data);
      await refetchGownTypes();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Academic gown type created successfully");
        setIsCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create academic gown type");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['academicGownTypes'],
    async (data) => {
      const result = await systemMaintenanceAPI.updateAcademicGownType(selectedId, {
        ...data,
        _id: selectedId,
        gownTypeId: data.gownTypeId,
      });
      await refetchGownTypes();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Academic gown type updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update academic gown type");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['academicGownTypes'],
    async (id) => {
      const result = await systemMaintenanceAPI.deleteAcademicGownType(id);
      await refetchGownTypes();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Academic gown type deleted successfully");
        setDeleteDialog({ isOpen: false, gownTypeToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete academic gown type");
      },
    }
  );

  // Column definitions
  const columns = [
    {
      key: "gownTypeId",
      header: "Gown Type ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "productType",
      header: "Product Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "size",
      header: "Size",
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
    setSelectedGownType(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    if (!row._id) {
      toast.error("Invalid academic gown type ID");
      return;
    }
    setFormData({
      _id: row._id,
      gownTypeId: row.gownTypeId,
      level: row.level,
      productType: row.productType,
      size: row.size,
      rawMaterialsUsed: row.rawMaterialsUsed.map((material) => ({
        category: material.category,
        type: material.type,
        quantity:
          typeof material.quantity === "number"
            ? material.quantity.toFixed(2)
            : "",
        unit: material.unit,
      })),
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      gownTypeToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.gownTypeToDelete) {
      await deleteMutation.mutateAsync(deleteDialog.gownTypeToDelete._id);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteMutation.isPending) {
      setDeleteDialog({ isOpen: false, gownTypeToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (isEditing && selectedId) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsEditing(false);
      setFormData({
        level: "",
        productType: "",
        size: "",
        rawMaterialsUsed: [{ category: "", type: "", quantity: "", unit: "" }],
      });
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
    setFormData({
      level: "",
      productType: "",
      size: "",
      rawMaterialsUsed: [{ category: "", type: "", quantity: "", unit: "" }],
    });
  };

  // Define actions for the academic gown types
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
          title="Academic Gown Type Management"
          description="Manage academic gown types in the system"
        />

        <DataTable
          data={gownTypes || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({
              level: "",
              productType: "",
              size: "",
              rawMaterialsUsed: [
                { category: "", type: "", quantity: "", unit: "" },
              ],
            });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Academic Gown Type</span>
            </div>
          }
        />

        {/* View Dialog */}
        <AcademicGownTypeDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          gownType={selectedGownType}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Academic Gown Type
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new academic gown type to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AcademicGownTypeForm
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
                form="academicGownTypeForm"
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
                Edit Academic Gown Type
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the academic gown type details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AcademicGownTypeForm
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
                form="academicGownTypeForm"
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
          title="Delete Academic Gown Type"
          description={
            deleteDialog.gownTypeToDelete
              ? `Are you sure you want to delete the academic gown type "${deleteDialog.gownTypeToDelete.productType}"? This action cannot be undone.`
              : "Are you sure you want to delete this academic gown type? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PrivateLayout>
  );
}
