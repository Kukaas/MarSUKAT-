import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Eye, Edit2, Trash2, Building2 } from "lucide-react";
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
import { toast } from "sonner";
import { DepartmentDetailsDialog } from "../components/details/department-details";
import { DepartmentForm } from "../forms/DepartmentForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";

export default function Department() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    description: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    departmentToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch departments data
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await systemMaintenanceAPI.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to fetch departments");
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Column definitions
  const columns = [
    {
      key: "departmentId",
      header: "Department ID",
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
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (value) => (
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-gray-500 mt-1" />
          <span className="line-clamp-2">{value}</span>
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
    setSelectedDepartment(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      department: row.department,
      description: row.description,
      departmentId: row.departmentId,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      departmentToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await systemMaintenanceAPI.deleteDepartment(
        deleteDialog.departmentToDelete._id
      );
      await fetchDepartments();
      toast.success("Department deleted successfully");
      setDeleteDialog({ isOpen: false, departmentToDelete: null });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete department"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, departmentToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await systemMaintenanceAPI.updateDepartment(selectedId, data);
        toast.success("Department updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await systemMaintenanceAPI.createDepartment(data);
        toast.success("Department created successfully");
        setIsCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({ department: "", description: "" });
      setSelectedId(null);
      fetchDepartments();
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
    setFormData({ department: "", description: "" });
  };

  // Define actions for the departments
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
          title="Department Management"
          description="Manage academic departments in the system"
        />

        <DataTable
          data={departments}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({ department: "", description: "" });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Department</span>
            </div>
          }
        />

        {/* View Dialog */}
        <DepartmentDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          department={selectedDepartment}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Department
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new department to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <DepartmentForm
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
                form="departmentForm"
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
                Edit Department
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the department details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <DepartmentForm
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
                form="departmentForm"
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
          title="Delete Department"
          description={
            deleteDialog.departmentToDelete
              ? `Are you sure you want to delete the department "${deleteDialog.departmentToDelete.department}"? This action cannot be undone.`
              : "Are you sure you want to delete this department? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />
      </div>
    </PrivateLayout>
  );
}
