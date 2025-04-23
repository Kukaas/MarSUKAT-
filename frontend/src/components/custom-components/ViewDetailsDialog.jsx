import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ViewDetailsDialog = ({
  open,
  onClose,
  title,
  children,
  className,
  maxWidth = "max-w-[95vw]",
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 p-0 bg-background",
          maxWidth,
          "h-[82vh] sm:h-[85vh] sm:max-w-[45vw]",
          className
        )}
      >
        {/* Sticky Header */}
        <DialogHeader className="flex-none bg-background px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="h-full px-6 py-4">{children}</div>
        </ScrollArea>

        {/* Sticky Footer */}
        <DialogFooter className="flex-none px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ViewDetailsDialog };
