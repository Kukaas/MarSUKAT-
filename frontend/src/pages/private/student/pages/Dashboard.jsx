import { useEffect, useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import EmptyState from "@/components/custom-components/EmptyState";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Clock,
  CreditCard,
  Info,
  Package,
  Bell,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dashboardAPI } from "../api/dashboardApi";
import { toast } from "sonner";
import { AvailableProducts } from "../components/AvailableProducts";
import { formatDate } from "@/lib/utils";
import { Announcements } from "../components/Announcements";

const getPriorityStyles = (priority) => {
  switch (priority) {
    case "high":
      return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
    case "medium":
      return "border-l-orange-500 bg-orange-50 dark:bg-orange-900/10";
    case "low":
    default:
      return "border-l-primary bg-card/50";
  }
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "medium":
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5 text-primary" />;
  }
};

export default function Dashboard() {
  return (
    <PrivateLayout>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          <SectionHeader title="Welcome Back!" description="Let's get started with your uniform order" />

          {/* Announcements Section */}
          <Announcements />

          {/* Quick Info Cards - Full width */}
          <div className="max-w-7xl mx-auto grid gap-3">
            <Alert className="bg-yellow-100 dark:bg-yellow-800/60 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-900 dark:text-yellow-300">
                Important Notice
              </AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                A ₱500 downpayment is required for your uniform order
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Downpayment</p>
                      <p className="text-lg font-bold">₱500.00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Processing</p>
                      <p className="text-lg font-bold">2-3 Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Info className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Payment</p>
                      <p className="text-lg font-bold">Cash Only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How to Order Section - Full width with contained steps */}
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Order Process" />
            <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Visit Garments",
                  description: "Request a Downpayment Form for your uniform",
                  icon: "👕",
                },
                {
                  number: "02",
                  title: "Make Payment",
                  description:
                    "Pay ₱500 at the cashier and secure your receipt",
                  icon: "💳",
                },
                {
                  number: "03",
                  title: "Book Appointment",
                  description: "Create an appointment through our system",
                  icon: "📅",
                },
                {
                  number: "04",
                  title: "Fill Details",
                  description: "Enter your receipt information in the form",
                  icon: "✍️",
                },
                {
                  number: "05",
                  title: "Submit",
                  description: "Wait for admin approval of your appointment",
                  icon: "✅",
                },
              ].map((step, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden border-l-4 border-l-primary h-full"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-lg font-semibold">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold flex items-center gap-2">
                          {step.title}{" "}
                          <span className="text-xl">{step.icon}</span>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <AvailableProducts />
        </div>
      </ScrollArea>
    </PrivateLayout>
  );
}
