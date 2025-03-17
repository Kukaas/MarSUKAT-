import { Dialog, DialogContent } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CheckCircle2, Circle, Archive } from "lucide-react";
import UnreadNotifications from "./tabs/UnreadNotifications";
import ReadNotifications from "./tabs/ReadNotifications";
import ArchivedNotifications from "./tabs/ArchivedNotifications";

const NotificationsModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] p-0">
        <Tabs defaultValue="unread" className="w-full">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-semibold tracking-tight">
              Notifications
            </h2>
          </div>

          <div className="px-6 py-2 border-b">
            <TabsList className="w-full justify-start gap-4">
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                Unread
                <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  3
                </span>
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Read
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="unread">
            <UnreadNotifications />
          </TabsContent>

          <TabsContent value="read">
            <ReadNotifications />
          </TabsContent>

          <TabsContent value="archive">
            <ArchivedNotifications />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
