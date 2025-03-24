import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Eye,
  Edit2,
  Trash2,
  User,
  Mail,
  GraduationCap,
  Power,
  Activity,
  Building,
  Users,
  AlertCircle,
  Loader2,
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
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { ConfirmationDialog } from "@/components/custom-components/ConfirmationDialog";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { StudentUserDetailsDialog } from "../components/details/student-user-details";

// DeactivateDialog Component
function DeactivateDialog({
  isOpen,
  onClose,
  onConfirm,
  student,
  isLoading = false,
}) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Deactivate Student Account</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {student ? (
              <>
                Are you sure you want to deactivate the student account for "
                <span className="font-medium">{student.name}</span>"?
              </>
            ) : (
              "Are you sure you want to deactivate this student account?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Deactivation Reason <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="Enter reason for deactivation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={cn(
              "resize-none",
              "bg-background",
              "border-input",
              "placeholder:text-muted-foreground/60",
              "focus-visible:ring-destructive",
              "dark:bg-card/50",
              "dark:border-border/50",
              "dark:placeholder:text-muted-foreground/50",
              "dark:focus-visible:ring-destructive"
            )}
            rows={3}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={cn(
              "border-border/50",
              "bg-background text-foreground",
              "hover:bg-accent hover:text-accent-foreground",
              "dark:bg-card/50",
              "dark:text-foreground",
              "dark:hover:bg-accent/50"
            )}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className={cn(
              "bg-destructive",
              "text-white",
              "hover:bg-destructive/90",
              "disabled:pointer-events-none disabled:opacity-50",
              "dark:bg-destructive",
              "dark:text-white",
              "dark:hover:bg-destructive/90"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Deactivating...</span>
              </>
            ) : (
              "Deactivate Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function StudentUser() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    studentToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    student: null,
    action: '', // 'verify' or 'activate'
  });
  const [deactivateDialog, setDeactivateDialog] = useState({
    isOpen: false,
    student: null,
  });

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await userAPI.getAllStudents();
      setStudents(data);
    } catch (error) {
      toast.error("Failed to fetch students");
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
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
      key: "studentNumber",
      header: "Student Number",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "verified",
      header: "Verified",
      render: (value) => (
        <StatusBadge
          status={value ? "Verified" : "Unverified"}
          variant={value ? "success" : "warning"}
          className="text-xs"
        />
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <StatusBadge
          status={value ? "Active" : "Inactive"}
          icon={Activity}
          variant={value ? "success" : "destructive"}
          className="text-xs"
        />
      ),
    },
  ];

  // Action handlers
  const handleView = (row) => {
    setSelectedStudent(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedStudent(row);
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      studentToDelete: row,
    });
  };

  const handleStatusAction = (row, action) => {
    if (action === 'deactivate') {
      setDeactivateDialog({
        isOpen: true,
        student: row,
      });
    } else {
      setStatusDialog({
        isOpen: true,
        student: row,
        action,
      });
    }
  };

  const handleDeactivateConfirm = async (reason) => {
    try {
      setIsSubmitting(true);
      await userAPI.deactivateStudent(deactivateDialog.student._id, reason);
      toast.success("Student account deactivated successfully");
      setDeactivateDialog({ isOpen: false, student: null });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to deactivate student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateCancel = () => {
    if (!isSubmitting) {
      setDeactivateDialog({ isOpen: false, student: null });
    }
  };

  const handleStatusConfirm = async () => {
    try {
      setIsSubmitting(true);
      const { student, action } = statusDialog;

      switch (action) {
        case 'verify':
          await userAPI.verifyStudent(student._id);
          toast.success("Student account verified successfully");
          break;
        case 'activate':
          await userAPI.activateStudent(student._id);
          toast.success("Student account activated successfully");
          break;
      }

      setStatusDialog({ isOpen: false, student: null, action: '' });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await userAPI.deleteStudent(deleteDialog.studentToDelete._id);
      await fetchStudents();
      toast.success("Student deleted successfully");
      setDeleteDialog({ isOpen: false, studentToDelete: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, studentToDelete: null });
    }
  };

  // Define actions for the students
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
          label: (row) => (!row.verified ? "Verify" : row.isActive ? "Deactivate" : "Activate"),
          icon: Power,
          onClick: (row) => handleStatusAction(row, !row.verified ? 'verify' : row.isActive ? 'deactivate' : 'activate'),
          variant: (row) => (!row.verified ? "success" : row.isActive ? "destructive" : "default"),
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
          title="Student User Management"
          description="Manage student users in the system"
        />

        <DataTable
          data={students}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
        />

        {/* View Details Dialog */}
        <StudentUserDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          data={selectedStudent}
          onEdit={() => handleEdit(selectedStudent)}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Student"
          description={
            deleteDialog.studentToDelete
              ? `Are you sure you want to delete the student "${deleteDialog.studentToDelete.name}"? This action cannot be undone.`
              : "Are you sure you want to delete this student? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />

        {/* Status Change Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={statusDialog.isOpen}
          onClose={() => setStatusDialog({ isOpen: false, student: null, action: '' })}
          onConfirm={handleStatusConfirm}
          title={`${statusDialog.action === 'verify' ? "Verify" : "Activate"} Student Account`}
          description={
            statusDialog.student
              ? `Are you sure you want to ${
                  statusDialog.action === 'verify' ? "verify" : "activate"
                } the student account for "${statusDialog.student.name}"?`
              : `Are you sure you want to ${
                  statusDialog.action === 'verify' ? "verify" : "activate"
                } this student account?`
          }
          confirmText={statusDialog.action === 'verify' ? "Verify" : "Activate"}
          cancelText="Cancel"
          isLoading={isSubmitting}
          variant="success"
        />

        {/* Deactivate Dialog */}
        <DeactivateDialog
          isOpen={deactivateDialog.isOpen}
          onClose={handleDeactivateCancel}
          onConfirm={handleDeactivateConfirm}
          student={deactivateDialog.student}
          isLoading={isSubmitting}
        />
      </div>
    </PrivateLayout>
  );
}
