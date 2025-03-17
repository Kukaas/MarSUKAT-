import { Circle } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";

const UnreadNotifications = () => {
  return (
    <ScrollArea className="h-[500px]">
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Circle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium">New Assignment Posted</h4>
                <span className="text-xs text-muted-foreground">
                  2 hours ago
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                A new assignment has been posted in your Mathematics class.
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default UnreadNotifications;
