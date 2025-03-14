import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import FormInput from "@/components/custom-components/FormInput";
import PasswordInput from "@/components/custom-components/PasswordInput";
import { authAPI } from "@/lib/api";
import { User, Mail } from "lucide-react";

const SUPER_ADMIN_ACCESS_KEY =
  import.meta.env.VITE_SUPER_ADMIN_ACCESS_KEY || "your-secure-key-here";

const accessKeySchema = z.object({
  accessKey: z.string().min(1, "Access key is required"),
});

const superAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

const CreateSuperAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const accessKeyForm = useForm({
    resolver: zodResolver(accessKeySchema),
    defaultValues: {
      accessKey: "",
    },
  });

  const superAdminForm = useForm({
    resolver: zodResolver(superAdminSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const handleAccessKeySubmit = (data) => {
    if (data.accessKey === SUPER_ADMIN_ACCESS_KEY) {
      setIsAuthenticated(true);
      toast.success("Access granted!");
    } else {
      toast.error("Invalid access key!");
    }
  };

  const handleCreateSuperAdmin = async (data) => {
    try {
      setIsLoading(true);
      await authAPI.createSuperAdmin(data);
      toast.success("Super admin created successfully!");
      superAdminForm.reset();
      navigate("/login");
    } catch (error) {
      console.error("SuperAdmin creation error:", error);

      // Get error code and message
      const errorCode = error.response?.data?.error;
      const errorMessage =
        error.response?.data?.message || "Failed to create super admin";

      // Show appropriate error message based on error code
      switch (errorCode) {
        case "MISSING_FIELDS":
          toast.error("Please fill in all required fields");
          break;
        case "EMAIL_EXISTS":
          toast.error("This email is already registered");
          break;
        case "SUPERADMIN_EXISTS":
          toast.error("A verified Super Admin account already exists");
          break;
        case "EMAIL_SEND_FAILED":
          toast.error("Failed to send verification email. Please try again");
          break;
        default:
          toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Super Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...accessKeyForm}>
              <form
                onSubmit={accessKeyForm.handleSubmit(handleAccessKeySubmit)}
                className="space-y-4"
              >
                <PasswordInput
                  form={accessKeyForm}
                  name="accessKey"
                  label="Access Key"
                  placeholder="Enter access key"
                />
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Create Super Admin Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...superAdminForm}>
            <form
              onSubmit={superAdminForm.handleSubmit(handleCreateSuperAdmin)}
              className="space-y-4"
            >
              <FormInput
                form={superAdminForm}
                name="name"
                label="Name"
                placeholder="Enter name"
                icon={User}
              />
              <FormInput
                form={superAdminForm}
                name="email"
                label="Email"
                type="email"
                placeholder="Enter email"
                icon={Mail}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Super Admin"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSuperAdmin;
