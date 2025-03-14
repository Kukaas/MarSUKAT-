import { useAuth } from "../../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, User as UserIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";

const TabItem = ({ value, icon: Icon, children, isActive }) => (
  <TabsTrigger
    value={value}
    className={cn(
      "relative px-6 py-2 rounded-none border-b-2 border-transparent",
      "text-muted-foreground hover:text-foreground",
      "transition-colors duration-200",
      "focus-visible:ring-0 focus-visible:ring-offset-0",
      "data-[state=active]:border-primary data-[state=active]:text-foreground",
      "flex items-center gap-2",
      "data-[state=active]:bg-accent/50"
    )}
  >
    <Icon
      className={cn(
        "h-4 w-4",
        "transition-colors duration-200",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    />
    {children}
  </TabsTrigger>
);

const ProfileModal = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = useCallback(() => {
    if (!isSubmitting) {
      setActiveTab("profile");
    }
  }, [isSubmitting]);

  const handleSubmitSuccess = useCallback(() => {
    setIsSubmitting(false);
    handleCancel();
  }, [handleCancel]);

  const handleOpenChange = useCallback(
    (isOpen) => {
      if (!isOpen && !isSubmitting) {
        setActiveTab("profile");
      }
      onOpenChange?.(isOpen);
    },
    [isSubmitting, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            Profile Information
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View and manage your profile details
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (!isSubmitting) {
              setActiveTab(value);
            }
          }}
          className="flex flex-col flex-1"
        >
          <div className="relative mt-2 border-b border-border/50">
            <TabsList className="relative h-12 w-full justify-start bg-transparent p-0 px-6">
              <TabItem
                value="profile"
                icon={UserIcon}
                isActive={activeTab === "profile"}
              >
                Profile
              </TabItem>
              <TabItem
                value="security"
                icon={Key}
                isActive={activeTab === "security"}
              >
                Security
              </TabItem>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(95vh-280px)] sm:h-[420px]">
            <div className="p-6">
              <TabsContent value="profile" className="mt-0">
                <ProfileTab user={user} />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityTab
                  onCancel={handleCancel}
                  onSubmitSuccess={handleSubmitSuccess}
                  isSubmitting={isSubmitting}
                  setIsSubmitting={setIsSubmitting}
                />
              </TabsContent>
            </div>
          </ScrollArea>

          {activeTab === "security" && (
            <DialogFooter className="p-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="changePasswordForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Changing Password..." : "Change Password"}
              </Button>
            </DialogFooter>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
