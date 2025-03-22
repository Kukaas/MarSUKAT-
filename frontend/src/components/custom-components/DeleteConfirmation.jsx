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
import { AlertTriangle } from "lucide-react";

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting = false,
}) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isDeleting && !open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-[425px] bg-background">
        <div className="grid gap-6 py-4">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-foreground">
                {title}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-6 text-muted-foreground">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-row gap-3 sm:gap-2">
            <AlertDialogCancel
              type="button"
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
              onClick={(e) => {
                e.preventDefault();
                if (!isDeleting) {
                  onClose();
                }
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={isDeleting}
              className="flex-1 sm:flex-none bg-destructive hover:bg-destructive/90 text-white"
              onClick={(e) => {
                e.preventDefault();
                if (!isDeleting) {
                  onConfirm();
                }
              }}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
