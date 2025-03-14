import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, AlertCircle } from "lucide-react";
import PasswordInput from "../custom-components/PasswordInput";
import { authAPI } from "../../lib/api";
import { toast } from "sonner";
import { useState } from "react";

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

const SecurityTab = ({ onCancel, onSubmitSuccess }) => {
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
      onSubmitSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default SecurityTab;
