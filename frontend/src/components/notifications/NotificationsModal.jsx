import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CheckCircle2, Circle } from "lucide-react";
import UnreadNotifications from "./tabs/UnreadNotifications";
import ReadNotifications from "./tabs/ReadNotifications";
import { notificationAPI } from "../../lib/api";
import { Button } from "../ui/button";

const NotificationsModal = ({ open, onOpenChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(new Set()); // Track notifications being marked as read
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(prev => new Set([...prev, notificationId]));
      await notificationAPI.markAsRead(notificationId);
      // Update the local state instead of refetching
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      await notificationAPI.markAllAsRead();
      // Update the local state instead of refetching
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const unreadNotifications = notifications?.filter(n => !n.read) || [];
  const hasUnreadNotifications = loading || unreadNotifications.length > 0; // Show button while loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[800px] p-0 h-[90vh] md:h-[600px] flex flex-col">
        <Tabs defaultValue="unread" className="w-full h-full flex flex-col">
          <div className="px-3 md:px-6 py-3 md:py-4 border-b">
            <h2 className="text-lg md:text-2xl font-semibold tracking-tight mb-2">
              Notifications
            </h2>
            {hasUnreadNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead || loading}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {markingAllAsRead ? "Marking all as read..." : "Mark all as read"}
              </Button>
            )}
          </div>

          <div className="px-3 md:px-6 py-2 border-b">
            <TabsList className="w-full justify-start gap-2">
              <TabsTrigger value="unread" className="flex items-center gap-1.5 text-xs">
                <Circle className="h-3.5 w-3.5" />
                Unread
                {unreadNotifications.length > 0 && (
                  <span className="ml-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Read
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="unread" className="h-full m-0">
              <UnreadNotifications 
                notifications={unreadNotifications}
                onMarkAsRead={handleMarkAsRead}
                loading={loading}
                markingAsRead={markingAsRead}
              />
            </TabsContent>

            <TabsContent value="read" className="h-full m-0">
              <ReadNotifications 
                notifications={notifications.filter(n => n.read) || []}
                loading={loading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
