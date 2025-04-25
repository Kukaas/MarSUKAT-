import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../../components/ui/form";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Loader2, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { authAPI } from "../../lib/api";
import { toast } from "sonner";
import PublicLayout from "./PublicLayout";
import FormInput from "@/components/custom-components/FormInput";
import LeftDescription from "@/components/auth/LeftDescription";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ResendVerification = () => {
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
      await authAPI.resendVerification(data.email);
      toast.success("Verification email sent!", {
        description: "Please check your inbox and spam folder.",
      });
      form.reset();
      navigate("/login");
    } catch (error) {
      // Handle specific error cases
      if (error.response?.data?.message) {
        toast.error("Resend verification failed", {
          description: error.response.data.message,
        });
      } else {
        toast.error("Resend verification failed", {
          description: "An unexpected error occurred. Please try again later.",
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
              title="Resend Verification Email"
              description="Enter your email address below to receive a new verification link."
            />
          </div>
        </div>

        <div className="lg:col-start-2 mt-10">
          <div className="min-h-screen bg-background">
            <div className="w-full px-6 py-16 lg:px-8 xl:px-12">
              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <h2 className="text-4xl font-bold tracking-tight text-foreground">
                    Resend Verification
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground">
                    Enter your email to receive a new verification link
                  </p>
                </div>

                <Card className="group hover:shadow-xl transition-all border-border bg-card">
                  <CardContent className="p-8">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormInput
                          form={form}
                          name="email"
                          label="Email"
                          placeholder="Enter your email address"
                          icon={Mail}
                          autoComplete="email"
                        />

                        <div className="flex items-center justify-between gap-4 pt-4">
                          <Link to="/login">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-11 px-6"
                              disabled={isLoading}
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back to Login
                            </Button>
                          </Link>

                          <Button
                            type="submit"
                            className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 px-6 ml-auto"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                                <>
                                    Sending...
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                </>
                            ) : (
                              <>
                                Send Email
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                          Don't have an account?{" "}
                          <Link
                            to="/signup"
                            className="font-medium text-primary hover:text-primary/90 transition-colors"
                          >
                            Sign up here
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
};

export default ResendVerification;
