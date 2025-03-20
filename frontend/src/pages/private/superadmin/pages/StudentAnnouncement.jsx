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
import { useEffect, useState } from "react";
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

export function StudentAnnouncement() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await systemMaintenanceAPI.getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      toast.error("Failed to fetch announcements");
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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
      setIsSubmitting(true);

      // Ensure dates are properly formatted
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      if (isEditing) {
        await systemMaintenanceAPI.updateAnnouncement(
          selectedId,
          formattedData
        );
        toast.success("Announcement updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await systemMaintenanceAPI.createAnnouncement(formattedData);
        toast.success("Announcement created successfully");
        setIsCreateDialogOpen(false);
      }

      setIsEditing(false);
      setFormData({
        title: "",
        content: "",
        startDate: "",
        endDate: "",
      });
      setSelectedId(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Operation error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
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
          data={announcements}
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
                  isSubmitting={isSubmitting}
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
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="announcementForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
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
                  isSubmitting={isSubmitting}
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
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="announcementForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, itemToDelete: null })}
          onConfirm={async () => {
            try {
              setIsDeleting(true);
              await systemMaintenanceAPI.deleteAnnouncement(
                deleteDialog.itemToDelete._id
              );
              toast.success("Announcement deleted successfully");
              fetchAnnouncements();
            } catch (error) {
              toast.error("Failed to delete announcement");
            } finally {
              setIsDeleting(false);
              setDeleteDialog({ isOpen: false, itemToDelete: null });
            }
          }}
          title="Delete Announcement"
          description="Are you sure you want to delete this announcement? This action cannot be undone."
          isDeleting={isDeleting}
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
