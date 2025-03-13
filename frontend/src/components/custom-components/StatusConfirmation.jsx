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

export function StatusConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isProcessing = false,
  isActivating = false,
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Power
              className={`h-5 w-5 ${
                isActivating ? "text-green-500" : "text-red-500"
              }`}
            />
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            onClick={() => !isProcessing && onClose()}
            disabled={isProcessing}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={
              isActivating
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isProcessing ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                {isActivating ? "Activating..." : "Deactivating..."}
              </>
            ) : isActivating ? (
              "Activate"
            ) : (
              "Deactivate"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
