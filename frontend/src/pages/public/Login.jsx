import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import PasswordInput from "@/components/custom-components/PasswordInput";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the return URL from location state or default to dashboard
  const returnUrl = location.state?.from?.pathname || "/dashboard";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(data);

      // Login will now only handle user state, cookies are handled by the server
      await login(response);

      toast.success("Login successful!", {
        description: "Welcome back to MarSUKAT.",
      });

      // Reset form and navigate to the return URL
      form.reset();
      navigate(returnUrl, { replace: true });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during login";

      // Handle specific error cases
      if (error.response?.status === 429) {
        // Rate limit error
        const minutes = error.response.data.lockoutRemaining;
        toast.error("Too many login attempts", {
          description: `Please try again in ${minutes} minutes.`,
        });
      } else if (error.response?.status === 401) {
        // Authentication error
        toast.error("Login failed", {
          description: errorMessage,
        });
      } else {
        // Other errors
        toast.error("Login failed", {
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
              title="Welcome Back"
              description="Sign in to access your MarSUKAT account and continue your journey with us."
            />
          </div>
        </div>

        <div className="lg:col-start-2 mt-10">
          <div className="min-h-screen bg-background">
            <div className="w-full px-6 py-16 lg:px-8 xl:px-12">
              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <h2 className="text-4xl font-bold tracking-tight text-foreground">
                    Sign In
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground">
                    Please enter your credentials to access your account
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
                          name="email"
                          label="Email"
                          type="email"
                          placeholder="Enter your email"
                          icon={Mail}
                        />

                        <PasswordInput
                          form={form}
                          name="password"
                          label="Password"
                          placeholder="Enter your password"
                        />

                        <div className="flex items-center justify-between">
                          <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                          Don't have an account?{" "}
                          <Link
                            to="/signup"
                            className="font-medium text-foreground hover:text-muted-foreground transition-colors"
                          >
                            Create one here
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

export default Login;
