import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Eye, Edit2, Trash2, GraduationCap, Ruler, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/custom-components/DataTable";
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
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import PrivateLayout from "../../PrivateLayout";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

import { AcademicGownInventoryForm } from "../forms/AcademicGownInventoryForm";
import { AcademicGownInventoryDetailsDialog } from "../components/details/academic-gown-inventory-details";
import { inventoryAPI } from "../api/inventoryApi";
import StatusBadge from "@/components/custom-components/StatusBadge";

export const AcademicGownInventory = () => {
  const navigate = useNavigate();
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    level: "",
    productType: "",
    size: "",
    quantity: "",
    status: "Available",
    image: null,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });

  // Fetch inventory data with caching
  const { data: inventoryItems, isLoading, refetch } = useDataFetching(
    ['academicGownInventory'],
    async () => {
      const data = await inventoryAPI.getAllAcademicGownInventory();
      // Sort data by createdAt in descending order (newest first)
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    {
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      onError: (error) => {
        toast.error("Failed to fetch inventory items");
        console.error(error);
      },
    }
  );

  // Create mutation
  const createMutation = useDataMutation(
    ['academicGownInventory'],
    async (data) => {
      const result = await inventoryAPI.createAcademicGownInventory(data);
      await refetch(); // Refetch data after successful creation
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Inventory item created successfully");
        setCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create inventory item");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['academicGownInventory'],
    async (data) => {
      const result = await inventoryAPI.updateAcademicGownInventory(selectedId, data);
      await refetch(); // Refetch data after successful update
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Inventory item updated successfully");
        setEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update inventory item");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['academicGownInventory'],
    async (id) => {
      const result = await inventoryAPI.deleteAcademicGownInventory(id);
      await refetch(); // Refetch data after successful deletion
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Inventory item deleted successfully");
        setDeleteDialog({ isOpen: false, itemToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete inventory item");
      },
    }
  );

  const handleView = (row) => {
    setSelectedInventory(row);
    setViewDetailsOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      level: row.level,
      productType: row.productType,
      size: row.size,
      quantity: row.quantity,
      status: row.status,
      image: row.image || null,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setEditDialogOpen(true);
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

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const handleDialogClose = (type) => {
    if (type === "edit") {
      setEditDialogOpen(false);
      setIsEditing(false);
      setSelectedId(null);
    } else if (type === "create") {
      setCreateDialogOpen(false);
    }
    setFormData({
      level: "",
      productType: "",
      size: "",
      quantity: "",
      status: "Available",
      image: null,
    });
  };

  const onCreateNew = () => {
    setFormData({
      level: "",
      productType: "",
      size: "",
      quantity: "",
      status: "Available",
      image: null,
    });
    setCreateDialogOpen(true);
  };

  const columns = [
    {
      key: "inventoryId",
      header: "Inventory ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
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
      key: "productType",
      header: "Product Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={value} icon={AlertCircle} />,
    },
  ];

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
          title="Academic Gown Inventory Management"
          description="Manage academic gown inventory in the system"
        />

        <DataTable
          data={inventoryItems || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={onCreateNew}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Gown Item</span>
            </div>
          }
        />

        {/* View Dialog */}
        <AcademicGownInventoryDetailsDialog
          isOpen={viewDetailsOpen}
          onClose={() => setViewDetailsOpen(false)}
          item={selectedInventory}
        />

        {/* Create Dialog */}
        <AlertDialog open={createDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Gown Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new item to the academic gown inventory
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AcademicGownInventoryForm
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
                form="academicGownInventoryForm"
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
        <AlertDialog open={editDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Edit Gown Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the academic gown item details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AcademicGownInventoryForm
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
                form="academicGownInventoryForm"
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
          title="Delete Gown Item"
          description={
            deleteDialog.itemToDelete
              ? `Are you sure you want to delete the gown item "${deleteDialog.itemToDelete.productType} (${deleteDialog.itemToDelete.size})"? This action cannot be undone.`
              : "Are you sure you want to delete this gown item? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PrivateLayout>
  );
}
