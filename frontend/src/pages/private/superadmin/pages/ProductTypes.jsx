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
import { ProductTypeDetails } from "../components/details/product-type-details";
import { ProductTypeForm } from "../forms/ProductTypeForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductTypeDetailsDialog } from "../components/details/product-type-details";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

export default function ProductTypes() {
  const { user } = useAuth();
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    level: "",
    productType: "",
    size: "",
    price: "",
    rawMaterialsUsed: [{ category: "", type: "", quantity: "", unit: "" }],
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    productTypeToDelete: null,
  });

  // Fetch product types data with caching
  const { data: productTypes, isLoading, refetch: refetchProductTypes } = useDataFetching(
    ['productTypes'],
    async () => {
      const data = await systemMaintenanceAPI.getAllProductTypes();
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
    ['productTypes'],
    async (data) => {
      const result = await systemMaintenanceAPI.createProductType(data);
      await refetchProductTypes();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Product type created successfully");
        setIsCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create product type");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['productTypes'],
    async (data) => {
      const result = await systemMaintenanceAPI.updateProductType(selectedId, {
        ...data,
        _id: selectedId,
        productTypeId: data.productTypeId,
      });
      await refetchProductTypes();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Product type updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update product type");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['productTypes'],
    async (id) => {
      const result = await systemMaintenanceAPI.deleteProductType(id);
      await refetchProductTypes();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Product type deleted successfully");
        setDeleteDialog({ isOpen: false, productTypeToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete product type");
      },
    }
  );

  // Column definitions
  const columns = [
    {
      key: "productTypeId",
      header: "Product Type ID",
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
      key: "price",
      header: "Price",
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            ₱{typeof value === "number" ? value.toFixed(2) : "0.00"}
          </span>
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
    setSelectedProductType(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    if (!row._id) {
      toast.error("Invalid product type ID");
      return;
    }
    setFormData({
      _id: row._id,
      productTypeId: row.productTypeId,
      level: row.level,
      productType: row.productType,
      size: row.size,
      price: typeof row.price === "number" ? row.price.toFixed(2) : "",
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
      productTypeToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.productTypeToDelete) {
      await deleteMutation.mutateAsync(deleteDialog.productTypeToDelete._id);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteMutation.isPending) {
      setDeleteDialog({ isOpen: false, productTypeToDelete: null });
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
        price: "",
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
      price: "",
      rawMaterialsUsed: [{ category: "", type: "", quantity: "", unit: "" }],
    });
  };

  // Define actions for the product types
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
          title="Product Type Management"
          description="Manage product types in the system"
        />

        <DataTable
          data={productTypes || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({
              level: "",
              productType: "",
              size: "",
              price: "",
              rawMaterialsUsed: [
                { category: "", type: "", quantity: "", unit: "" },
              ],
            });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Product Type</span>
            </div>
          }
        />

        {/* View Dialog */}
        <ProductTypeDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          productType={selectedProductType}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Product Type
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new product type to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <ProductTypeForm
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
                form="productTypeForm"
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
                Edit Product Type
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the product type details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <ProductTypeForm
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
                form="productTypeForm"
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
          title="Delete Product Type"
          description={
            deleteDialog.productTypeToDelete
              ? `Are you sure you want to delete the product type "${deleteDialog.productTypeToDelete.productType}"? This action cannot be undone.`
              : "Are you sure you want to delete this product type? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PrivateLayout>
  );
}
