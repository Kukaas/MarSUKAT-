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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Mail,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PasswordInput from "../custom-components/PasswordInput";
import { Form } from "../ui/form";
import { authAPI } from "../../lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const PasswordRequirements = ({ password }) => {
  const requirements = [
    {
      text: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      text: "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      text: "Contains lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      text: "Contains number",
      met: /\d/.test(password),
    },
    {
      text: "Contains special character",
      met: /[@$!%*?&]/.test(password),
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Password Requirements:
      </p>
      <div className="grid gap-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <ShieldCheck className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span
              className={req.met ? "text-green-500" : "text-muted-foreground"}
            >
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileModal = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await authAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success("Password changed successfully");
      form.reset();
      setActiveTab("profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-semibold">
            Profile Information
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            View and manage your profile details
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col flex-1"
        >
          <TabsList className="w-full px-6">
            <TabsTrigger value="profile" className="flex-1">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1">
              <Key className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(95vh-280px)] sm:h-[420px]">
            <div className="p-6">
              <TabsContent value="profile" className="mt-0 space-y-6">
                {/* Profile Avatar and Name */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.photo} alt={user?.name} />
                    <AvatarFallback className="text-lg">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{user?.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {user?.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* User Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={user?.verified ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {user?.verified ? "Verified" : "Not Verified"}
                    </Badge>
                    {user?.isActive !== undefined && (
                      <Badge
                        variant={user?.isActive ? "success" : "destructive"}
                        className="text-xs"
                      >
                        {user?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-6">
                <Alert>
                  <AlertDescription>
                    For your security, please enter your current password first.
                  </AlertDescription>
                </Alert>

                <Form {...form}>
                  <form
                    id="changePasswordForm"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <PasswordInput
                      form={form}
                      name="currentPassword"
                      label="Current Password"
                      placeholder="Enter your current password"
                    />

                    <div className="space-y-4">
                      <PasswordInput
                        form={form}
                        name="newPassword"
                        label="New Password"
                        placeholder="Enter your new password"
                      />
                      <PasswordRequirements password={newPassword || ""} />
                    </div>

                    <PasswordInput
                      form={form}
                      name="confirmPassword"
                      label="Confirm New Password"
                      placeholder="Confirm your new password"
                    />
                  </form>
                </Form>
              </TabsContent>
            </div>
          </ScrollArea>

          {activeTab === "security" && (
            <DialogFooter className="p-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveTab("profile");
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="changePasswordForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </DialogFooter>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
