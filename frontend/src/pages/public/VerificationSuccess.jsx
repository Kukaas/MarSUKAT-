import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

const VerificationSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <Card className="max-w-sm w-full mx-auto bg-white shadow-xl animate-fade-in border-gray-200">
        <div className="p-6 sm:p-8">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-green-100 rounded-full"></div>
              <CheckCircle className="relative mx-auto h-16 w-16 text-green-600 animate-bounce" />
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Email Successfully Verified
              </h2>
              <p className="text-gray-600">
                Your account has been verified and activated. You now have full
                access to all features and services.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link to="/login" className="block">
                <Button
                  className="w-full bg-gray-900 hover:bg-gray-800 shadow transition-all group"
                  size="lg"
                >
                  <span className="flex items-center justify-center gap-2 text-white">
                    Continue to Login
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>

              <Link to="/" className="block">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 transition-all"
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

export default VerificationSuccess;
