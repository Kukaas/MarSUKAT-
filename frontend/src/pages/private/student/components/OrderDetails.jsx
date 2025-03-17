import { formatDate, cn } from "@/lib/utils";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Receipt,
  User,
  Mail,
  School,
  Building2,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Ruler,
  PackageCheck,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "@/components/custom-components/ImageViewer";
import { StatusMessage } from "@/components/custom-components/StatusMessage";

// Add status icons mapping
const STATUS_ICONS = {
  Rejected: AlertCircle,
  Pending: Clock,
  Approved: CheckCircle2,
  Measured: Ruler,
  "For Pickup": PackageCheck,
  Claimed: ShoppingBag,
};

const InfoCard = ({ icon: Icon, label, value, className }) => (
  <Card
    className={cn(
      "group border-border/50 shadow-sm",
      "bg-card hover:bg-accent transition-colors duration-200",
      "dark:bg-card/95 dark:hover:bg-accent/90",
      className
    )}
  >
    <CardContent className="flex items-start p-3 sm:p-4 gap-3 sm:gap-4">
      <div className="rounded-full bg-primary/10 p-2 sm:p-2.5 ring-1 ring-border/50 shrink-0 dark:bg-primary/20 group-hover:ring-primary/50 transition-all duration-200">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-medium break-words text-foreground">
          {value || "Not specified"}
        </p>
      </div>
    </CardContent>
  </Card>
);

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="h-5 sm:h-6 w-1 rounded-full bg-gradient-to-b from-primary/80 to-primary/50" />
    <h3 className="text-base sm:text-lg font-semibold text-foreground">
      {children}
    </h3>
  </div>
);

function OrderContent({ order }) {
  // Add state for tracking open/closed sections
  const [openSections, setOpenSections] = useState({});
  // Add state for image viewer
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  // Toggle section
  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Helper function to filter receipts by type
  const getReceiptsByType = (type) => {
    if (!order?.receipt) return null;
    if (order.receipt.type === type) return order.receipt;
    return null;
  };

  // Get receipts for each type
  const downPayment = getReceiptsByType("Down Payment");
  const partialPayment = getReceiptsByType("Partial Payment");
  const fullPayment = getReceiptsByType("Full Payment");

  // Add helper function to check if order is rejected
  const isRejected = order?.status === "Rejected";

  const renderReceiptSection = (receipt, title, sectionId) => {
    if (!receipt) return null;

    const isOpen = openSections[sectionId];

    return (
      <div className="space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection(sectionId)}
        >
          <SectionTitle>{title}</SectionTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isOpen && (
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              {/* Receipt Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    OR Number
                  </p>
                  <p className="font-medium">{receipt.orNumber}</p>
                </div>
                <StatusBadge
                  status={receipt.isVerified ? "Verified" : "Pending"}
                  icon={receipt.isVerified ? CheckCircle2 : Clock}
                />
              </div>

              {/* Receipt Details */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <InfoCard
                  icon={Receipt}
                  label="Amount"
                  value={`₱${receipt.amount.toFixed(2)}`}
                />
                <InfoCard
                  icon={Calendar}
                  label="Date Paid"
                  value={formatDate(receipt.datePaid)}
                />
              </div>

              {/* Updated Receipt Image section */}
              {receipt.image?.data && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Receipt Image
                  </p>
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border/50 cursor-pointer group"
                    onClick={() => setImageViewerOpen(true)}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                    <img
                      src={receipt.image.data}
                      alt={`Receipt ${receipt.orNumber}`}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error("Image load error");
                        e.target.src = "/placeholder-image.png";
                        e.target.className = "object-contain p-4 w-full h-full";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Add ImageViewer */}
              <ImageViewer
                isOpen={imageViewerOpen}
                onClose={() => setImageViewerOpen(false)}
                imageUrl={receipt.image?.data}
                title={`Receipt ${receipt.orNumber}`}
              />

              {/* Verification Status */}
              {!receipt.isVerified && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Pending Verification
                      </p>
                      <p className="text-xs mt-0.5 text-amber-700 dark:text-amber-400">
                        This receipt is currently being reviewed
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Order Info */}
        <div className="relative">
          <div className="absolute inset-0 h-32 sm:h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4 ring-4 ring-background shadow-xl">
              <Receipt className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center pb-3 sm:pb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                {order?.orderId}
              </h3>
              <div className="flex flex-col gap-2 items-center">
                <StatusBadge
                  status={order?.status}
                  icon={STATUS_ICONS[order?.status]}
                  className="text-xs sm:text-sm"
                />
              </div>

              {/* Replace Rejection Message */}
              {isRejected && order?.rejectionReason && (
                <StatusMessage
                  type="rejected"
                  title="Order Rejected"
                  message={order.rejectionReason}
                  reminder="Please contact the office for more information or to submit a new order."
                />
              )}
            </div>
          </div>
        </div>

        {/* Add Measurement Schedule Section */}
        {order?.status !== "Pending" && (
          <div className="space-y-4">
            <SectionTitle>Measurement Schedule</SectionTitle>
            <Card className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                {order?.measurementSchedule ? (
                  <>
                    <div className="flex items-center gap-2 text-primary">
                      <CalendarIcon className="h-5 w-5" />
                      <span className="font-semibold">
                        Scheduled Measurement
                      </span>
                    </div>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <InfoCard
                        icon={Calendar}
                        label="Date"
                        value={formatDate(
                          order.measurementSchedule.date,
                          "long"
                        )}
                      />
                      <InfoCard
                        icon={Clock}
                        label="Time"
                        value={order.measurementSchedule.time}
                      />
                    </div>
                    {/* Update Measurement Schedule Message */}
                    {order?.status === "Approved" &&
                      order?.measurementSchedule && (
                        <StatusMessage
                          type="warning"
                          title="Important Reminders"
                          steps={["Valid School ID", "Payment Receipt"]}
                          reminder="Please arrive on time for your scheduled measurement."
                        />
                      )}
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No measurement schedule set
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Personal Information</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard icon={User} label="Name" value={order?.name} />
            <InfoCard icon={Mail} label="Email" value={order?.email} />
            <InfoCard
              icon={School}
              label="Student Number"
              value={order?.studentNumber}
            />
            <InfoCard icon={Building2} label="Level" value={order?.level} />
            <InfoCard
              icon={Building2}
              label="Department"
              value={order?.department}
            />
            <InfoCard icon={Users} label="Gender" value={order?.gender} />
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Payment Summary</SectionTitle>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Amount Paid
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    ₱{order?.receipt?.amount.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Update the receipt section renders with unique IDs */}
        {renderReceiptSection(
          downPayment,
          "Down Payment Receipt",
          "downPayment"
        )}
        {renderReceiptSection(
          partialPayment,
          "Partial Payment Receipt",
          "partialPayment"
        )}
        {renderReceiptSection(
          fullPayment,
          "Full Payment Receipt",
          "fullPayment"
        )}

        {/* Order History */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Order History</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard
              icon={Calendar}
              label="Created At"
              value={formatDate(order?.createdAt)}
            />
            <InfoCard
              icon={Calendar}
              label="Last Updated"
              value={formatDate(order?.updatedAt)}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export function OrderDetailsDialog({ isOpen, onClose, order }) {
  if (!order) return null;

  return (
    <ViewDetailsDialog open={isOpen} onClose={onClose} title="Order Details">
      <OrderContent order={order} />
    </ViewDetailsDialog>
  );
}
