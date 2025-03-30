import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CheckCircle2, Circle } from "lucide-react";
import UnreadNotifications from "./tabs/UnreadNotifications";
import ReadNotifications from "./tabs/ReadNotifications";
import { notificationAPI } from "../../lib/api";
import { Button } from "../ui/button";
import { CustomTabs, TabPanel } from "../custom-components/CustomTabs";

function NotificationsModal({ open, onOpenChange }) {
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

  // Tab configuration for CustomTabs
  const tabConfig = [
    { 
      value: "unread", 
      label: <>
        Unread
        {unreadNotifications.length > 0 && (
          <span className="ml-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            {unreadNotifications.length}
          </span>
        )}
      </>, 
      icon: Circle 
    },
    { 
      value: "read", 
      label: "Read", 
      icon: CheckCircle2 
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[800px] p-0 h-[82vh] md:h-[600px] flex flex-col">
        <div className="w-full h-full flex flex-col">
          <DialogHeader className="px-3 md:px-6 py-3 md:py-4 border-b">
            <DialogTitle className="text-lg md:text-2xl font-semibold tracking-tight mb-2">
              Notifications
            </DialogTitle>
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
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            <CustomTabs
              defaultValue="unread"
              tabs={tabConfig}
              className="w-full h-full flex flex-col"
            >
              <TabPanel value="unread" className="flex-1 overflow-auto p-0">
                <UnreadNotifications 
                  notifications={unreadNotifications}
                  onMarkAsRead={handleMarkAsRead}
                  loading={loading}
                  markingAsRead={markingAsRead}
                />
              </TabPanel>

              <TabPanel value="read" className="flex-1 overflow-auto p-0">
                <ReadNotifications 
                  notifications={notifications.filter(n => n.read) || []}
                  loading={loading}
                />
              </TabPanel>
            </CustomTabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NotificationsModal;

