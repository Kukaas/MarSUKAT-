import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function RejectDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Reject Order",
  description = "Are you sure you want to reject this order?",
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
      <AlertDialogContent className="dark:border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive dark:text-red-400" />
            <span className="text-foreground">{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Rejection Reason{" "}
            <span className="text-destructive dark:text-red-400">*</span>
          </label>
          <Textarea
            placeholder="Enter reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={cn(
              "resize-none",
              "bg-background dark:bg-card",
              "border-input dark:border-border/50",
              "placeholder:text-muted-foreground/60",
              "focus-visible:ring-destructive dark:focus-visible:ring-red-400",
              "dark:text-foreground"
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
              "hover:bg-accent hover:text-accent-foreground",
              "dark:bg-card dark:text-foreground",
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
              "bg-destructive text-destructive-foreground",
              "hover:bg-destructive/90",
              "dark:bg-red-900/90 dark:text-red-50",
              "dark:hover:bg-red-900/75",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Rejecting...</span>
              </>
            ) : (
              "Reject Order"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
