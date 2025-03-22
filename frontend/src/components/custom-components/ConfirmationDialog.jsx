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
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "default", // 'default', 'success', 'destructive'
  icon: CustomIcon,
}) {
  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    switch (variant) {
      case "success":
        return CheckCircle2;
      case "destructive":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-green-500";
      case "destructive":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const getButtonStyle = () => {
    switch (variant) {
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "destructive":
        return "bg-destructive hover:bg-destructive/90 text-white";
      default:
        return "bg-primary hover:bg-primary/90 text-white";
    }
  };

  const Icon = getIcon();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", getIconColor())} />
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            onClick={() => !isLoading && onClose()}
            disabled={isLoading}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(getButtonStyle())}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
