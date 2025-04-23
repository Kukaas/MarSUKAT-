import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Bell,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { formatDate } from "@/lib/utils";
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
import { AnnouncementForm } from "../forms/AnnouncementForm";
import { AnnouncementDetailsDialog } from "../components/details/announcement-details";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

export function StudentAnnouncement() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });

  // Fetch announcements data with caching
  const { data: announcements, isLoading, refetch: refetchAnnouncements } = useDataFetching(
    ['announcements'],
    async () => {
      const data = await systemMaintenanceAPI.getAllAnnouncements();
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
    ['announcements'],
    async (data) => {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      const result = await systemMaintenanceAPI.createAnnouncement(formattedData);
      await refetchAnnouncements();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Announcement created successfully");
        setIsCreateDialogOpen(false);
        handleDialogClose("create");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create announcement");
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['announcements'],
    async (data) => {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      const result = await systemMaintenanceAPI.updateAnnouncement(selectedId, formattedData);
      await refetchAnnouncements();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Announcement updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update announcement");
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['announcements'],
    async (id) => {
      const result = await systemMaintenanceAPI.deleteAnnouncement(id);
      await refetchAnnouncements();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Announcement deleted successfully");
        setDeleteDialog({ isOpen: false, itemToDelete: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete announcement");
      },
    }
  );

  const columns = [
    {
      key: "announcementId",
      header: "Announcement ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (value) => (
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: "endDate",
      header: "End Date",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{formatDate(value)}</span>
        </div>
      ),
    },
  ];

  const handleSubmit = async (data) => {
    try {
      if (isEditing && selectedId) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsEditing(false);
      setFormData({
        title: "",
        content: "",
        startDate: "",
        endDate: "",
      });
      setSelectedId(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
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
      title: "",
      content: "",
      startDate: "",
      endDate: "",
    });
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
          onClick: (row) => {
            const formattedData = {
              ...row,
              startDate: new Date(row.startDate).toISOString().split("T")[0],
              endDate: new Date(row.endDate).toISOString().split("T")[0],
            };
            setFormData(formattedData);
            setSelectedId(row._id);
            setIsEditing(true);
            setIsEditDialogOpen(true);
          },
        },
      ],
    },
    delete: {
      label: "Delete Actions",
      actions: [
        {
          label: "Delete",
          icon: Trash2,
          onClick: (row) => {
            setDeleteDialog({
              isOpen: true,
              itemToDelete: row,
            });
          },
          variant: "destructive",
        },
      ],
    },
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Student Announcement Management"
          description="Manage student announcements in the system"
        />

        <DataTable
          data={announcements || []}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({
              title: "",
              content: "",
              startDate: "",
              endDate: "",
            });
            setIsEditing(false);
            setSelectedId(null);
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Announcement</span>
            </div>
          }
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Announcement
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new announcement to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AnnouncementForm
                  formData={formData}
                  onSubmit={handleSubmit}
                  isSubmitting={createMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({
                    title: "",
                    content: "",
                    startDate: "",
                    endDate: "",
                  });
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="announcementForm"
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
                Edit Announcement
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the announcement details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AnnouncementForm
                  formData={formData}
                  isEdit={true}
                  onSubmit={handleSubmit}
                  isSubmitting={updateMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setFormData({
                    title: "",
                    content: "",
                    startDate: "",
                    endDate: "",
                  });
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="announcementForm"
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
          onClose={() => setDeleteDialog({ isOpen: false, itemToDelete: null })}
          onConfirm={async () => {
            if (deleteDialog.itemToDelete) {
              await deleteMutation.mutateAsync(deleteDialog.itemToDelete._id);
            }
          }}
          title="Delete Announcement"
          description="Are you sure you want to delete this announcement? This action cannot be undone."
          isDeleting={deleteMutation.isPending}
        />

        {/* View Dialog */}
        <AnnouncementDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />
      </div>
    </PrivateLayout>
  );
}
