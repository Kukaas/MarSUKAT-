import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { KeyRound, Loader2, LockKeyhole } from "lucide-react";
import PublicLayout from "./PublicLayout";
import LeftDescription from "@/components/auth/LeftDescription";
import FormInput from "@/components/custom-components/FormInput";
import PasswordInput from "@/components/custom-components/PasswordInput";
import { otpAPI } from "@/lib/api";

const formSchema = z
  .object({
    otp: z
      .string()
      .min(6, "OTP must be 6 digits")
      .max(6, "OTP must be 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function VerifyOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await otpAPI.verifyOTPAndChangePassword({
        userId,
        otp: data.otp,
        newPassword: data.newPassword,
      });

      toast.success("Password Reset Successful!", {
        description: "You can now login with your new password.",
      });

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to verify OTP";

      if (error.response?.status === 400) {
        toast.error("Invalid OTP", {
          description: error.response.data.message,
        });
      } else {
        toast.error("Failed to reset password", {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:block lg:relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            <LeftDescription
              title="Reset Password"
              description="Enter the OTP sent to your email and create a new password."
            />
          </div>
        </div>

        <div className="lg:col-start-2 mt-10">
          <div className="min-h-screen bg-background">
            <div className="w-full px-6 py-16 lg:px-8 xl:px-12">
              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <h2 className="text-4xl font-bold tracking-tight text-foreground">
                    Verify OTP
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground">
                    Enter the OTP sent to your email and set a new password
                  </p>
                </div>

                <Card className="group hover:shadow-xl transition-all border-border bg-card">
                  <CardContent className="p-8">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <FormInput
                          form={form}
                          name="otp"
                          label="OTP Code"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          icon={KeyRound}
                        />

                        <PasswordInput
                          form={form}
                          name="newPassword"
                          label="New Password"
                          placeholder="Enter new password"
                        />

                        <PasswordInput
                          form={form}
                          name="confirmPassword"
                          label="Confirm Password"
                          placeholder="Confirm new password"
                        />

                        <Button
                          type="submit"
                          className="w-full h-11 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Resetting Password...
                            </>
                          ) : (
                            "Reset Password"
                          )}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                          Didn't receive the code?{" "}
                          <Link
                            to="/forgot-password"
                            className="font-medium text-foreground hover:text-muted-foreground transition-colors"
                          >
                            Request again
                          </Link>
                        </p>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
