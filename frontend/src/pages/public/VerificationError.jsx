import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  XCircle,
  AlertCircle,
  ArrowRight,
  Home,
  RefreshCcw,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

const ERROR_TYPES = {
  EXPIRED: "expired",
  INVALID: "invalid",
  NOT_FOUND: "not_found",
};

const ERROR_MESSAGES = {
  [ERROR_TYPES.EXPIRED]: {
    title: "Verification Link Expired",
    description:
      "This verification link has expired. Please sign up again to receive a new verification link.",
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  [ERROR_TYPES.INVALID]: {
    title: "Invalid Verification Link",
    description:
      "This verification link is invalid or has been tampered with. Please check your email for the correct link.",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  [ERROR_TYPES.NOT_FOUND]: {
    title: "Verification Link Not Found",
    description:
      "We couldn't find your verification record. The link might have expired or already been used.",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const VerificationError = () => {
  const [searchParams] = useSearchParams();
  const errorType = searchParams.get("type") || ERROR_TYPES.INVALID;
  const error = ERROR_MESSAGES[errorType];
  const ErrorIcon = error.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <Card className="max-w-sm w-full mx-auto bg-white shadow-xl animate-fade-in border-gray-200">
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
              <h2 className="text-2xl font-bold text-gray-900">
                {error.title}
              </h2>
              <p className="text-gray-600">{error.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {errorType === ERROR_TYPES.EXPIRED && (
                <Link to="/signup" className="block">
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 shadow transition-all group"
                    size="lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Sign Up Again
                      <RefreshCcw className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </span>
                  </Button>
                </Link>
              )}

              <Link to="/login" className="block">
                <Button
                  variant={
                    errorType === ERROR_TYPES.EXPIRED ? "outline" : "default"
                  }
                  className={
                    errorType === ERROR_TYPES.EXPIRED
                      ? "w-full border-gray-200 hover:bg-gray-50 transition-all"
                      : "w-full bg-gray-900 hover:bg-gray-800 shadow transition-all group text-white"
                  }
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
                  variant="outline"
                  className="w-full border-gray-20 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Home className="w-4 h-4" />
                    Return to Home
                  </span>
                </Button>
              </Link>
            </div>

            {/* Help Link */}
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <a href="#" className="text-gray-900 hover:underline font-medium">
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
