import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function DeactivateDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
  userType = "user",
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
            <span>Deactivate {userType} Account</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user ? (
              <>
                Are you sure you want to deactivate the {userType} account for "
                <span className="font-medium">{user.name}</span>"?
              </>
            ) : (
              `Are you sure you want to deactivate this ${userType} account?`
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