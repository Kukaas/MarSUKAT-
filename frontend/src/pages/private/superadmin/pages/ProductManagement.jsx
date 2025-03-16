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
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { ProductDetailsDialog } from "../components/product-details";
import { StatusConfirmation } from "@/components/custom-components/StatusConfirmation";

export function ProductManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    item: null,
  });
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Fetch products data
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await systemMaintenanceAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
        <span className={value ? "text-green-600" : "text-red-600"}>
          {value ? "Active" : "Inactive"}
        </span>
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
    try {
      setIsDeleting(true);
      await systemMaintenanceAPI.deleteProduct(deleteDialog.itemToDelete._id);
      await fetchProducts();
      toast.success("Product deleted successfully");
      setDeleteDialog({ isOpen: false, itemToDelete: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, itemToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await systemMaintenanceAPI.updateProduct(selectedId, data);
        toast.success("Product updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await systemMaintenanceAPI.createProduct(data);
        toast.success("Product created successfully");
        setIsCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({
        level: "",
        productType: "",
        isActive: true,
      });
      setSelectedId(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
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
    try {
      setIsStatusUpdating(true);
      const item = statusDialog.item;

      if (item.isActive) {
        await systemMaintenanceAPI.deactivateProduct(item._id);
        toast.success("Product deactivated successfully");
      } else {
        await systemMaintenanceAPI.activateProduct(item._id);
        toast.success("Product activated successfully");
      }

      await fetchProducts();
      setStatusDialog({ isOpen: false, item: null });
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleStatusCancel = () => {
    if (!isStatusUpdating) {
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
          data={products}
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
                  isSubmitting={isSubmitting}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() =>
                  !isSubmitting &&
                  handleDialogClose(isEditing ? "edit" : "create")
                }
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="productForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
          isDeleting={isDeleting}
        />

        {/* Add Status Confirmation Dialog */}
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
          isUpdating={isStatusUpdating}
          status={statusDialog.item?.isActive ? "deactivate" : "activate"}
        />
      </div>
    </PrivateLayout>
  );
}
