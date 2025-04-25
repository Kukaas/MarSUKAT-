import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  XCircle,
  AlertCircle,
  ArrowRight,
  Home,
  RefreshCcw,
  Mail,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { authAPI } from "../../lib/api";
import { toast } from "sonner";

const ERROR_TYPES = {
  EXPIRED: "expired",
  INVALID: "invalid",
  NOT_FOUND: "not_found",
};

const ERROR_MESSAGES = {
  [ERROR_TYPES.EXPIRED]: {
    title: "Verification Link Expired",
    description:
      "This verification link has expired. Please request a new verification link.",
    icon: AlertCircle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  [ERROR_TYPES.INVALID]: {
    title: "Invalid Verification Link",
    description:
      "This verification link is invalid or has been tampered with. Please check your email for the correct link.",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  [ERROR_TYPES.NOT_FOUND]: {
    title: "Verification Link Not Found",
    description:
      "We couldn't find your verification record. The link might have expired or already been used.",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
};

const VerificationError = () => {
  const [searchParams] = useSearchParams();
  const errorType = searchParams.get("type") || ERROR_TYPES.INVALID;
  const email = searchParams.get("email") || "";
  const error = ERROR_MESSAGES[errorType];
  const ErrorIcon = error.icon;
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    if (!email) {
      navigate("/resend-verification");
      return;
    }

    try {
      setIsResending(true);
      await authAPI.resendVerification(email);
      toast.success("Verification email sent!", {
        description: "Please check your inbox and spam folder.",
      });
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
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background/80 p-4">
      <Card className="max-w-sm w-full mx-auto bg-card shadow-xl animate-fade-in border-border">
        <div className="p-6 sm:p-8">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="relative">
              <div
                className={`absolute inset-0 animate-pulse ${error.bgColor} rounded-full`}
              />
              <ErrorIcon
                className={`relative mx-auto h-16 w-16 ${error.color}`}
              />
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                {error.title}
              </h2>
              <p className="text-muted-foreground">{error.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {errorType === ERROR_TYPES.EXPIRED && (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow transition-all group"
                  size="lg"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isResending ? "Sending..." : "Resend Verification Email"}
                    {isResending ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </span>
                </Button>
              )}

              {errorType !== ERROR_TYPES.EXPIRED && (
                <Link to="/resend-verification" className="block">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow transition-all group"
                    size="lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Resend Verification Email
                      <Mail className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
              )}

              <Link to="/login" className="block">
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-accent transition-all"
                  size="lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    Continue to Login
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>

              <Link to="/" className="block">
                <Button
                  variant="ghost"
                  className="w-full transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Home className="w-4 h-4" />
                    Return to Home
                  </span>
                </Button>
              </Link>
            </div>

            {/* Help Link */}
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a href="#" className="text-foreground hover:underline font-medium">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerificationError;
