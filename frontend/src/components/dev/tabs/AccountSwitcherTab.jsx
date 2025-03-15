import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, UserCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { devAPI } from "@/lib/api";
import StatusBadge from "@/components/custom-components/StatusBadge";

const AccountSwitcherTab = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await devAPI.getAvailableUsers();
      setUsers(users || []);
      console.log("Available users:", users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users", {
        description:
          error.response?.data?.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchUser = async () => {
    if (!selectedUser) return;

    setSwitching(true);
    try {
      await devAPI.switchUser(selectedUser);
      toast.success("User switched successfully", {
        description: "Reloading page to apply changes...",
      });

      // Give the toast time to be seen before reloading
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Failed to switch user:", error);
      toast.error("Failed to switch user", {
        description:
          error.response?.data?.message || "An unexpected error occurred",
      });
    } finally {
      setSwitching(false);
    }
  };

  // Group users by role
  const groupedUsers = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {});

  // Find selected user details
  const selectedUserDetails = selectedUser
    ? users.find((user) => user.email === selectedUser)
    : null;

  return (
    <div className="space-y-4 pb-4">
      {currentUser && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <StatusBadge status="Active" />
              Current User
            </CardTitle>
            <CardDescription>You are currently logged in as:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center gap-2">
                <StatusBadge status={currentUser.role} />
                <span className="text-sm font-medium">{currentUser.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Switch User</CardTitle>
          <CardDescription>Select a user to switch to:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="w-full">
              <Select onValueChange={setSelectedUser} className="w-full">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[280px]">
                    {Object.keys(groupedUsers).length > 0 ? (
                      Object.entries(groupedUsers).map(([role, roleUsers]) => (
                        <SelectGroup key={role}>
                          <SelectLabel className="text-xs font-medium px-2 py-1.5">
                            {role}
                          </SelectLabel>
                          {roleUsers.map((user) => (
                            <SelectItem
                              key={user.email}
                              value={user.email}
                              className="text-sm"
                            >
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">
                        No users available
                      </div>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedUserDetails && (
            <Card className="border border-input/30">
              <CardContent className="pt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedUserDetails.name}
                    </span>
                    <StatusBadge
                      status={selectedUserDetails.role}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <code className="text-xs bg-muted/50 px-2 py-1 rounded">
                      {selectedUserDetails.email}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleSwitchUser}
            disabled={!selectedUser || switching}
            className="w-full"
          >
            {switching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Switch User
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Refresh User List
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSwitcherTab;
