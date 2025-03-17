import { CheckCircle2 } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";

const ReadNotifications = () => {
  return (
    <ScrollArea className="h-[500px]">
      <div className="p-6 space-y-4">
        {[1, 2].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer opacity-80"
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium">Grade Updated</h4>
                <span className="text-xs text-muted-foreground">
                  2 days ago
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your grade for Physics has been updated.
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ReadNotifications;
