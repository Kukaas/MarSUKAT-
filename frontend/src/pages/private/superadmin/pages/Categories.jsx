import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Eye, Edit2, Trash2, Tag } from "lucide-react";
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
import { CategoryDetailsDialog } from "../components/details/category-details";
import { CategoryForm } from "../forms/CategoryForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

export default function Categories() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    categoryToDelete: null,
  });

  // Fetch categories data with caching
  const { data: categories, isLoading, refetch: refetchCategories } = useDataFetching(
    ['categories'],
    async () => {
      const data = await systemMaintenanceAPI.getAllCategories();
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
    ['categories'],
    async (data) => {
      const result = await systemMaintenanceAPI.createCategory(data);
      await refetchCategories();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Category created successfully");
        setIsCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create category");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['categories'],
    async (data) => {
      const result = await systemMaintenanceAPI.updateCategory(selectedId, data);
      await refetchCategories();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Category updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update category");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['categories'],
    async (id) => {
      const result = await systemMaintenanceAPI.deleteCategory(id);
      await refetchCategories();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Category deleted successfully");
        setDeleteDialog({ isOpen: false, categoryToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete category");
      },
    }
  );

  // Column definitions
  const columns = [
    {
      key: "categoryId",
      header: "Category ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
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
    setSelectedCategory(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      category: row.category,
      categoryId: row.categoryId,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      categoryToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.categoryToDelete) {
      await deleteMutation.mutateAsync(deleteDialog.categoryToDelete._id);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteMutation.isPending) {
      setDeleteDialog({ isOpen: false, categoryToDelete: null });
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
      setFormData({ category: "" });
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
    setFormData({ category: "" });
  };

  // Define actions for the categories
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
          title="Category Management"
          description="Manage categories in the system"
        />

        <DataTable
          data={categories || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({ category: "" });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Category</span>
            </div>
          }
        />

        {/* View Dialog */}
        <CategoryDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          category={selectedCategory}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Category
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new category to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <CategoryForm
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
                form="categoryForm"
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
                Edit Category
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the category details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <CategoryForm
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
                form="categoryForm"
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
          title="Delete Category"
          description={
            deleteDialog.categoryToDelete
              ? `Are you sure you want to delete the category "${deleteDialog.categoryToDelete.category}"? This action cannot be undone.`
              : "Are you sure you want to delete this category? This action cannot be undone."
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PrivateLayout>
  );
}
