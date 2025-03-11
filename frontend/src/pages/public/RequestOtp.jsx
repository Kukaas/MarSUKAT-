import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, Loader2 } from "lucide-react";
import PublicLayout from "./PublicLayout";
import LeftDescription from "@/components/auth/LeftDescription";
import FormInput from "@/components/custom-components/FormInput";
import { Link } from "react-router-dom";
import { otpAPI } from "@/lib/api";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function RequestOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await otpAPI.requestOTP(data.email);

      toast.success("OTP Sent!", {
        description: "Please check your email for the OTP code.",
      });

      // Navigate to verify OTP page with userId
      navigate(`/verify-otp/${response.userId}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send OTP";

      if (error.response?.status === 404) {
        toast.error("Email not found", {
          description: "Please check your email address and try again.",
        });
      } else {
        toast.error("Failed to send OTP", {
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
              description="Enter your email address and we'll send you an OTP to reset your password."
            />
          </div>
        </div>

        <div className="lg:col-start-2 mt-10">
          <div className="min-h-screen bg-white lg:bg-gray-50/50">
            <div className="w-full px-6 py-16 lg:px-8 xl:px-12">
              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    Forgot Password
                  </h2>
                  <p className="mt-3 text-base text-gray-600">
                    Enter your email to receive a password reset OTP
                  </p>
                </div>

                <Card className="group hover:shadow-xl transition-all border-gray-100/50 bg-white">
                  <CardContent className="p-8">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <FormInput
                          form={form}
                          name="email"
                          label="Email"
                          type="email"
                          placeholder="Enter your email"
                          icon={Mail}
                        />

                        <Button
                          type="submit"
                          className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            "Send OTP"
                          )}
                        </Button>

                        <p className="text-center text-sm text-gray-500 mt-6">
                          Remember your password?{" "}
                          <Link
                            to="/login"
                            className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                          >
                            Back to login
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
