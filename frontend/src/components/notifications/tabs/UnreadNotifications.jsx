import { Circle, Loader2, Check, ChevronDown } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import EmptyState from "../../custom-components/EmptyState";
import { Button } from "../../ui/button";
import { useState } from "react";
import { cn } from "../../../lib/utils";

const LoadingSpinner = () => (
  <div className="h-[400px] relative">
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute -inset-3 rounded-full bg-primary/10 animate-pulse"></div>
        <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-base font-medium text-muted-foreground">
          Loading Notifications
        </p>
        <p className="text-sm text-muted-foreground/60">
          Please wait while we fetch your notifications
        </p>
      </div>
    </div>
  </div>
);

const NotificationItem = ({ notification, onMarkAsRead, isMarking }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongMessage = notification.message.length > 100;

  return (
    <div className="flex flex-col gap-2 p-3 md:p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Circle className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">
            {notification.title}
          </h4>
          <p className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="pl-10">
        <p className={cn(
          "text-xs md:text-sm text-muted-foreground",
          !isExpanded && hasLongMessage && "md:line-clamp-none",
          !isExpanded && hasLongMessage && "line-clamp-2"
        )}>
          {notification.message}
        </p>
        
        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onMarkAsRead(notification._id)}
            disabled={isMarking}
            className="h-7 px-2 text-[10px] md:text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {isMarking ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Marking as read...
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Mark as read
              </>
            )}
          </Button>

          {hasLongMessage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 md:hidden"
            >
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform",
                isExpanded && "transform rotate-180"
              )} />
              {isExpanded ? "Show less" : "Show more"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const UnreadNotifications = ({ notifications = [], onMarkAsRead, loading, markingAsRead }) => {
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="p-2 md:p-4 space-y-3">
          {loading ? (
            <LoadingSpinner />
          ) : !notifications || notifications.length === 0 ? (
            <EmptyState 
              icon={Circle}
              message="No unread notifications"
              className="h-[400px] flex items-center justify-center"
            />
          ) : (
            sortedNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                isMarking={markingAsRead.has(notification._id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UnreadNotifications;
