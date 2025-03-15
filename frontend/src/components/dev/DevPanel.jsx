import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Code2,
  Loader2,
  UserCheck,
  Settings,
  Database,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { devAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { isDevelopment } from "@/lib/utils";
import AccountSwitcherTab from "./tabs/AccountSwitcherTab";
import EnvironmentTab from "./tabs/EnvironmentTab";
import ApiDebuggerTab from "./tabs/ApiDebuggerTab";

const TABS = [
  { id: "account-switcher", shortcut: "1" },
  { id: "environment", shortcut: "2" },
  { id: "api-debugger", shortcut: "3" },
];

const DevPanel = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("account-switcher");
  const { user: currentUser } = useAuth();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Shift + D to toggle dev panel
      if (e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // Only handle other shortcuts if panel is open
      if (!open) return;

      // Number keys 1-3 to switch tabs
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        const tab = TABS.find((t) => t.shortcut === e.key);
        if (tab) {
          e.preventDefault();
          setActiveTab(tab.id);
          return;
        }
      }

      // Escape to close
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Only show in development mode
  if (!isDevelopment()) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 bg-muted hover:bg-muted/80 text-foreground shadow-md"
        onClick={() => setOpen(true)}
      >
        <Code2 className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Developer Tools
              </DialogTitle>
              <DialogDescription className="m-0 text-xs flex items-center gap-2">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⇧</span> D
                </kbd>
                <span className="text-muted-foreground">
                  Development mode only
                </span>
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="px-6 pt-4">
            <Tabs
              defaultValue="account-switcher"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger
                  value="account-switcher"
                  className="flex items-center gap-2 justify-center"
                >
                  <UserCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Account Switcher</span>
                  <span className="sm:hidden">Accounts</span>
                  <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                    1
                  </kbd>
                </TabsTrigger>
                <TabsTrigger
                  value="environment"
                  className="flex items-center gap-2 justify-center"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Environment</span>
                  <span className="sm:hidden">Env</span>
                  <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                    2
                  </kbd>
                </TabsTrigger>
                <TabsTrigger
                  value="api-debugger"
                  className="flex items-center gap-2 justify-center"
                >
                  <Bug className="h-4 w-4" />
                  <span className="hidden sm:inline">API Debugger</span>
                  <span className="sm:hidden">API</span>
                  <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                    3
                  </kbd>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 h-[calc(90vh-220px)]">
                <ScrollArea className="h-full pr-4">
                  <TabsContent
                    value="account-switcher"
                    className="mt-0 focus-visible:outline-none focus-visible:ring-0 data-[state=active]:h-full"
                  >
                    <AccountSwitcherTab currentUser={currentUser} />
                  </TabsContent>

                  <TabsContent
                    value="environment"
                    className="mt-0 focus-visible:outline-none focus-visible:ring-0 data-[state=active]:h-full"
                  >
                    <EnvironmentTab />
                  </TabsContent>

                  <TabsContent
                    value="api-debugger"
                    className="mt-0 focus-visible:outline-none focus-visible:ring-0 data-[state=active]:h-full"
                  >
                    <ApiDebuggerTab />
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>

            <div className="text-xs text-muted-foreground mt-4 mb-6 text-center px-4 py-2 bg-muted/30 rounded-md">
              ⚠️ These features are only for development and testing purposes.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DevPanel;
