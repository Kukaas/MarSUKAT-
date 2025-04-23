import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Box,
  GraduationCap,
  Package,
  Power,
  PowerOff,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductForm } from "../forms/ProductForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ProductDetailsDialog } from "../components/details/product-details";
import { StatusConfirmation } from "@/components/custom-components/StatusConfirmation";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";
import StatusBadge from "@/components/custom-components/StatusBadge";

export default function ProductManagement() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    level: "",
    productType: "",
    isActive: true,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    item: null,
  });

  // Fetch products data with caching
  const { data: products, isLoading, refetch: refetchProducts } = useDataFetching(
    ['products'],
    async () => {
      const data = await systemMaintenanceAPI.getAllProducts();
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
    ['products'],
    async (data) => {
      const result = await systemMaintenanceAPI.createProduct(data);
      await refetchProducts();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Product created successfully");
        setIsCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create product");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['products'],
    async (data) => {
      const result = await systemMaintenanceAPI.updateProduct(selectedId, data);
      await refetchProducts();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Product updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update product");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['products'],
    async (id) => {
      const result = await systemMaintenanceAPI.deleteProduct(id);
      await refetchProducts();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Product deleted successfully");
        setDeleteDialog({ isOpen: false, itemToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete product");
      },
    }
  );

  // Status toggle mutation
  const statusMutation = useDataMutation(
    ['products'],
    async (id) => {
      const item = statusDialog.item;
      if (item.isActive) {
        return await systemMaintenanceAPI.deactivateProduct(id);
      } else {
        return await systemMaintenanceAPI.activateProduct(id);
      }
    },
    {
      onSuccess: () => {
        toast.success(
          statusDialog.item?.isActive
            ? "Product deactivated successfully"
            : "Product activated successfully"
        );
        setStatusDialog({ isOpen: false, item: null });
        refetchProducts();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update status");
      },
    }
  );

  // Column definitions
  const columns = [
    {
      key: "productId",
      header: "Product ID",
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
          <Package className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
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
    setFormData({
      level: row.level,
      productType: row.productType,
      images: row.images || [],
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
        isActive: true,
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
      level: "",
      productType: "",
      isActive: true,
    });
  };

  const handleStatusToggle = (row) => {
    setStatusDialog({
      isOpen: true,
      item: row,
    });
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
          title="Product Management"
          description="Manage products in the system"
        />

        <DataTable
          data={products || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({
              level: "",
              productType: "",
            });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </div>
          }
        />

        {/* View Dialog */}
        <ProductDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />

        {/* Create/Edit Dialog */}
        <AlertDialog open={isCreateDialogOpen || isEditDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                {isEditing ? "Edit Product" : "Create New Product"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                {isEditing
                  ? "Modify the product details"
                  : "Add a new product to the system"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <ProductForm
                  formData={formData}
                  setFormData={setFormData}
                  isEdit={isEditing}
                  onSubmit={handleSubmit}
                  isSubmitting={isEditing ? updateMutation.isPending : createMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() =>
                  !(isEditing ? updateMutation.isPending : createMutation.isPending) &&
                  handleDialogClose(isEditing ? "edit" : "create")
                }
                disabled={isEditing ? updateMutation.isPending : createMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="productForm"
                disabled={isEditing ? updateMutation.isPending : createMutation.isPending}
              >
                {(isEditing ? updateMutation.isPending : createMutation.isPending) ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update"
                ) : (
                  "Create"
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
          title="Delete Product"
          description={
            deleteDialog.itemToDelete
              ? `Are you sure you want to delete the product "${deleteDialog.itemToDelete.productType}"? This action cannot be undone.`
              : "Are you sure you want to delete this product? This action cannot be undone."
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
          } Product`}
          description={
            statusDialog.item
              ? `Are you sure you want to ${
                  statusDialog.item.isActive ? "deactivate" : "activate"
                } the product "${statusDialog.item.productType}"?`
              : "Are you sure you want to update this product's status?"
          }
          isUpdating={statusMutation.isPending}
          status={statusDialog.item?.isActive ? "deactivate" : "activate"}
        />
      </div>
    </PrivateLayout>
  );
}
