import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  User,
  Mail,
  Briefcase,
  Power,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { userAPI } from "@/lib/api";
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
import { toast } from "sonner";
import { StaffUserDetailsDialog } from "../components/details/staff-user-details";
import { StaffUserForm } from "../forms/StaffUserForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { ConfirmationDialog } from "@/components/custom-components/ConfirmationDialog";
import StatusBadge from "@/components/custom-components/StatusBadge";

export default function StaffUsers() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedStaffUser, setSelectedStaffUser] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    role: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    staffUserToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    staffUser: null,
    isActivating: false,
  });

  // Fetch staff users data
  const fetchStaffUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userAPI.getAllStaffUsers();
      setStaffUsers(data);
    } catch (error) {
      toast.error("Failed to fetch staff users");
      console.error("Error fetching staff users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  // Column definitions
  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (value) => (
        <span className="font-medium capitalize">{value}</span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <StatusBadge
          status={value ? "Active" : "Inactive"}
          icon={Activity}
          className="text-xs"
        />
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
    setSelectedStaffUser(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    if (!row._id) {
      toast.error("Invalid staff user ID");
      return;
    }
    setFormData({
      _id: row._id,
      name: row.name,
      email: row.email,
      position: row.position,
      role: row.role,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      staffUserToDelete: row,
    });
  };

  const handleToggleStatus = (row) => {
    setStatusDialog({
      isOpen: true,
      staffUser: row,
      isActivating: !row.isActive,
    });
  };

  const handleStatusConfirm = async () => {
    try {
      setIsSubmitting(true);
      const { staffUser, isActivating } = statusDialog;

      if (isActivating) {
        await userAPI.activateStaffUser(staffUser._id);
        toast.success("Staff user activated successfully");
      } else {
        await userAPI.deactivateStaffUser(staffUser._id);
        toast.success("Staff user deactivated successfully");
      }

      setStatusDialog({ isOpen: false, staffUser: null, isActivating: false });
      fetchStaffUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusCancel = () => {
    if (!isSubmitting) {
      setStatusDialog({ isOpen: false, staffUser: null, isActivating: false });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await userAPI.deleteStaffUser(deleteDialog.staffUserToDelete._id);
      await fetchStaffUsers();
      toast.success("Staff user deleted successfully");
      setDeleteDialog({ isOpen: false, staffUserToDelete: null });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete staff user"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, staffUserToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditing && selectedId) {
        await userAPI.updateStaffUser(selectedId, data);
        toast.success("Staff user updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await userAPI.createStaffUser(data);
        toast.success("Staff user created successfully");
        setIsCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({
        name: "",
        email: "",
        position: "",
        role: "",
      });
      setSelectedId(null);
      fetchStaffUsers();
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
    setFormData({
      name: "",
      email: "",
      position: "",
      role: "",
    });
  };

  // Define actions for the staff users
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
          icon: Power,
          onClick: handleToggleStatus,
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
          title="Staff User Management"
          description="Manage staff users (Job Order and BAO) in the system"
        />

        <DataTable
          data={staffUsers}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({
              name: "",
              email: "",
              position: "",
              role: "",
            });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Staff User</span>
            </div>
          }
        />

        {/* View Dialog */}
        <StaffUserDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          data={selectedStaffUser}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Staff User
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new staff user to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <StaffUserForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </ScrollArea>
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
                form="staffUserForm"
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
                Edit Staff User
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the staff user details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <StaffUserForm
                  formData={formData}
                  setFormData={setFormData}
                  isEdit={true}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </ScrollArea>
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
                form="staffUserForm"
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
          title="Delete Staff User"
          description={
            deleteDialog.staffUserToDelete
              ? `Are you sure you want to delete the staff user "${deleteDialog.staffUserToDelete.name}"? This action cannot be undone.`
              : "Are you sure you want to delete this staff user? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />

        {/* Status Change Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={statusDialog.isOpen}
          onClose={handleStatusCancel}
          onConfirm={handleStatusConfirm}
          title={`${statusDialog.isActivating ? "Activate" : "Deactivate"} Staff User`}
          description={
            statusDialog.staffUser
              ? `Are you sure you want to ${
                  statusDialog.isActivating ? "activate" : "deactivate"
                } the staff user "${statusDialog.staffUser.name}"? ${
                  statusDialog.isActivating
                    ? "This will allow the user to access the system."
                    : "This will prevent the user from accessing the system."
                }`
              : `Are you sure you want to ${
                  statusDialog.isActivating ? "activate" : "deactivate"
                } this staff user? ${
                  statusDialog.isActivating
                    ? "This will allow the user to access the system."
                    : "This will prevent the user from accessing the system."
                }`
          }
          confirmText={statusDialog.isActivating ? "Activate" : "Deactivate"}
          cancelText="Cancel"
          isLoading={isSubmitting}
          variant={statusDialog.isActivating ? "success" : "destructive"}
        />
      </div>
    </PrivateLayout>
  );
} 