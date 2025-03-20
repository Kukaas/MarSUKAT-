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
import { JobOrderDetailsDialog } from "../components/details/job-order-details";
import { JobOrderForm } from "../forms/JobOrderForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { StatusConfirmation } from "@/components/custom-components/StatusConfirmation";
import StatusBadge from "@/components/custom-components/StatusBadge";

export default function JobOrders() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [jobOrders, setJobOrders] = useState([]);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    jobType: "",
    jobDescription: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    jobOrderToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    jobOrder: null,
    isActivating: false,
  });

  // Fetch job orders data
  const fetchJobOrders = async () => {
    try {
      setIsLoading(true);
      const data = await userAPI.getAllJobOrders();
      setJobOrders(data);
    } catch (error) {
      toast.error("Failed to fetch job orders");
      console.error("Error fetching job orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobOrders();
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
      key: "jobType",
      header: "Job Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
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
    setSelectedJobOrder(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    if (!row._id) {
      toast.error("Invalid job order ID");
      return;
    }
    setFormData({
      _id: row._id,
      name: row.name,
      email: row.email,
      gender: row.gender,
      jobType: row.jobType,
      jobDescription: row.jobDescription,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      jobOrderToDelete: row,
    });
  };

  const handleToggleStatus = (row) => {
    setStatusDialog({
      isOpen: true,
      jobOrder: row,
      isActivating: !row.isActive,
    });
  };

  const handleStatusConfirm = async () => {
    try {
      setIsSubmitting(true);
      const { jobOrder, isActivating } = statusDialog;

      if (isActivating) {
        await userAPI.activateJobOrder(jobOrder._id);
        toast.success("Job order activated successfully");
      } else {
        await userAPI.deactivateJobOrder(jobOrder._id);
        toast.success("Job order deactivated successfully");
      }

      setStatusDialog({ isOpen: false, jobOrder: null, isActivating: false });
      fetchJobOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusCancel = () => {
    if (!isSubmitting) {
      setStatusDialog({ isOpen: false, jobOrder: null, isActivating: false });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await userAPI.deleteJobOrder(deleteDialog.jobOrderToDelete._id);
      await fetchJobOrders();
      toast.success("Job order deleted successfully");
      setDeleteDialog({ isOpen: false, jobOrderToDelete: null });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete job order"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, jobOrderToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditing && selectedId) {
        await userAPI.updateJobOrder(selectedId, data);
        toast.success("Job order updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await userAPI.createJobOrder(data);
        toast.success("Job order created successfully");
        setIsCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        gender: "",
        jobType: "",
        jobDescription: "",
      });
      setSelectedId(null);
      fetchJobOrders();
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
      password: "",
      gender: "",
      jobType: "",
      jobDescription: "",
    });
  };

  // Define actions for the job orders
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
          renderLabel: (row) => (row.isActive ? "Deactivate" : "Activate"),
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
          title="Job Order Management"
          description="Manage job orders in the system"
        />

        <DataTable
          data={jobOrders}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({
              name: "",
              email: "",
              password: "",
              gender: "",
              jobType: "",
              jobDescription: "",
            });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Job Order</span>
            </div>
          }
        />

        {/* View Dialog */}
        <JobOrderDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          data={selectedJobOrder}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Job Order
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new job order to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <JobOrderForm
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
                form="jobOrderForm"
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
                Edit Job Order
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the job order details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <JobOrderForm
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
                form="jobOrderForm"
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
          title="Delete Job Order"
          description={
            deleteDialog.jobOrderToDelete
              ? `Are you sure you want to delete the job order for "${deleteDialog.jobOrderToDelete.name}"? This action cannot be undone.`
              : "Are you sure you want to delete this job order? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />

        {/* Status Change Confirmation Dialog */}
        <StatusConfirmation
          isOpen={statusDialog.isOpen}
          onClose={handleStatusCancel}
          onConfirm={handleStatusConfirm}
          title={`${
            statusDialog.isActivating ? "Activate" : "Deactivate"
          } Job Order`}
          description={
            statusDialog.jobOrder
              ? `Are you sure you want to ${
                  statusDialog.isActivating ? "activate" : "deactivate"
                } the job order for "${statusDialog.jobOrder.name}"?`
              : `Are you sure you want to ${
                  statusDialog.isActivating ? "activate" : "deactivate"
                } this job order?`
          }
          isProcessing={isSubmitting}
          isActivating={statusDialog.isActivating}
        />
      </div>
    </PrivateLayout>
  );
}
