import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Eye, Edit2, Trash2, Tag } from "lucide-react";
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
import { CategoryDetailsDialog } from "../components/category-details";
import { CategoryForm } from "../forms/CategoryForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";

export default function Categories() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    categoryToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories data
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await systemMaintenanceAPI.getAllCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    try {
      setIsDeleting(true);
      await systemMaintenanceAPI.deleteCategory(
        deleteDialog.categoryToDelete._id
      );
      await fetchCategories();
      toast.success("Category deleted successfully");
      setDeleteDialog({ isOpen: false, categoryToDelete: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, categoryToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await systemMaintenanceAPI.updateCategory(selectedId, data);
        toast.success("Category updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await systemMaintenanceAPI.createCategory(data);
        toast.success("Category created successfully");
        setIsCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({ category: "" });
      setSelectedId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
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
          data={categories}
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
                isSubmitting={isSubmitting}
              />
            </div>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !isSubmitting && handleDialogClose("create")}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="categoryForm"
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
                isSubmitting={isSubmitting}
              />
            </div>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !isSubmitting && handleDialogClose("edit")}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="categoryForm"
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
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Category"
          description={
            deleteDialog.categoryToDelete
              ? `Are you sure you want to delete the category "${deleteDialog.categoryToDelete.category}"? This action cannot be undone.`
              : "Are you sure you want to delete this category? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />
      </div>
    </PrivateLayout>
  );
}
