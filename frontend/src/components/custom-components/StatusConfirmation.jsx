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
import { Power } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isUpdating,
  status = "deactivate", // or "activate"
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Power
              className={`h-5 w-5 ${
                status === "activate" ? "text-green-500" : "text-red-500"
              }`}
            />
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            onClick={() => !isUpdating && onClose()}
            disabled={isUpdating}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={onConfirm}
            disabled={isUpdating}
            className={cn(
              status === "deactivate"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isUpdating ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Updating...
              </>
            ) : status === "deactivate" ? (
              "Deactivate"
            ) : (
              "Activate"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
