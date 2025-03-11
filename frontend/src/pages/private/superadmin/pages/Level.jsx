import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
  X,
} from "lucide-react";
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
import { LevelDetails } from "../components/level-details";
import { LevelForm } from "../forms/LevelForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";

export default function Level() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    level: "",
    description: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    levelToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch levels data
  const fetchLevels = async () => {
    try {
      setIsLoading(true);
      const data = await systemMaintenanceAPI.getAllLevels();
      setLevels(data);
    } catch (error) {
      toast.error("Failed to fetch levels");
      console.error("Error fetching levels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  // Column definitions
  const columns = [
    {
      key: "levelId",
      header: "Level ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
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
    setSelectedLevel(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      level: row.level,
      description: row.description,
      levelId: row.levelId,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      levelToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await systemMaintenanceAPI.deleteLevel(deleteDialog.levelToDelete._id);
      toast.success("Level deleted successfully");
      fetchLevels();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete level");
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, levelToDelete: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, levelToDelete: null });
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditing) {
        const { level, description } = data;
        await systemMaintenanceAPI.updateLevel(selectedId, {
          level,
          description,
        });
        toast.success("Level updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await systemMaintenanceAPI.createLevel(data);
        toast.success("Level created successfully");
        setIsCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({ level: "", description: "" });
      setSelectedId(null);
      fetchLevels();
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
    setFormData({ level: "", description: "" });
  };

  // Define actions for the levels
  const actions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: handleView,
    },
    {
      label: "Edit",
      icon: Edit2,
      onClick: handleEdit,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDeleteClick,
      variant: "destructive",
    },
  ];

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Level Management"
          description="Manage academic levels in the system"
        />

        <DataTable
          data={levels}
          columns={columns}
          isLoading={isLoading}
          actions={actions}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Level</span>
            </div>
          }
        />

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-semibold">
                    Level Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-500">
                    View comprehensive information about this level
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            <div className="py-2">
              {selectedLevel && <LevelDetails level={selectedLevel} />}
            </div>
            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <AlertDialog
          open={isCreateDialogOpen}
          onOpenChange={() => !isSubmitting && handleDialogClose("create")}
        >
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Level
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new level to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <LevelForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                variant="outline"
                onClick={() => handleDialogClose("create")}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="levelForm"
                className="w-full sm:w-auto"
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
        <AlertDialog
          open={isEditDialogOpen}
          onOpenChange={() => !isSubmitting && handleDialogClose("edit")}
        >
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Edit Level
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the level details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <LevelForm
                formData={formData}
                setFormData={setFormData}
                isEdit={true}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                variant="outline"
                onClick={() => handleDialogClose("edit")}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="levelForm"
                className="w-full sm:w-auto"
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
          title="Delete Level"
          description={
            deleteDialog.levelToDelete
              ? `Are you sure you want to delete the level "${deleteDialog.levelToDelete.level}"? This action cannot be undone.`
              : "Are you sure you want to delete this level? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />
      </div>
    </PrivateLayout>
  );
}
