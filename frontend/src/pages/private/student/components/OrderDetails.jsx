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
  Shirt,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "@/components/custom-components/ImageViewer";
import { StatusMessage } from "@/components/custom-components/StatusMessage";
import EmptyState from "@/components/custom-components/EmptyState";

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
  // Update the initial state for openSections
  const [openSections, setOpenSections] = useState({
    orderItems: order?.status === "Measured",
    studentInfo: false,
    measurement: order?.status === "Approved",
    timeline: false,
    receipts: order?.status === "Pending",
    downPayment: order?.status === "Pending",
    partialPayment: false,
    fullPayment: false,
  });
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
          <div className="flex items-center justify-between flex-1">
            <h4 className="text-sm font-medium">{title}</h4>
            <StatusBadge
              status={receipt.isVerified ? "Verified" : "Pending"}
              icon={receipt.isVerified ? CheckCircle2 : Clock}
            />
          </div>
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
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    OR Number
                  </p>
                  <p className="font-medium">{receipt.orNumber}</p>
                </div>
              </div>

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

              {!receipt.isVerified && (
                <StatusMessage
                  type="warning"
                  title="Receipt Pending Verification"
                  message="Your receipt is currently being reviewed."
                  steps={[
                    "Verify payment details",
                    "Schedule your measurement",
                    "Send you a notification",
                  ]}
                />
              )}

              {receipt.image?.data && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Receipt Image
                  </p>
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border cursor-pointer group"
                    onClick={() => setImageViewerOpen(true)}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                    <img
                      src={receipt.image.data}
                      alt={`Receipt ${receipt.orNumber}`}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
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
        {/* Header section */}
        <div className="relative">
          <div className="absolute inset-0 h-32 sm:h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4 ring-4 ring-background shadow-xl">
              <Receipt className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                  {order?.orderId}
                </h3>
                <StatusBadge
                  status={order?.status}
                  icon={STATUS_ICONS[order?.status]}
                  className="text-xs sm:text-sm"
                />
              </div>

              {/* Add Status Messages */}
              {isRejected && order?.rejectionReason && (
                <StatusMessage
                  type="rejected"
                  title="Order Rejected"
                  message={order.rejectionReason}
                  reminder="Please contact the office for more information or to submit a new order."
                />
              )}

              {order?.status === "Pending" && (
                <StatusMessage
                  type="warning"
                  title="Order Pending"
                  message="Your order is currently being reviewed."
                  steps={[
                    "Verify payment receipt",
                    "Schedule measurement",
                    "Notify you of the schedule",
                  ]}
                />
              )}

              {order?.status === "Approved" && (
                <StatusMessage
                  type="success"
                  title="Order Approved"
                  message="Your payment has been verified."
                  reminder="Please wait for your measurement schedule."
                />
              )}
            </div>
          </div>
        </div>

        {/* Pending Status Flow */}
        {order?.status === "Pending" && (
          <>
            {/* Receipts Section */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("receipts")}
              >
                <SectionTitle>Receipts</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.receipts ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.receipts && (
                <div className="space-y-4 pl-4 border-l border-border/50">
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

                  {!downPayment && !partialPayment && !fullPayment && (
                    <Card>
                      <CardContent className="p-6">
                        <EmptyState
                          icon={Receipt}
                          title="No Receipts"
                          description="No payment receipts have been added yet."
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("studentInfo")}
              >
                <SectionTitle>Student Information</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.studentInfo ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.studentInfo && (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <InfoCard icon={User} label="Name" value={order?.name} />
                  <InfoCard icon={Mail} label="Email" value={order?.email} />
                  <InfoCard
                    icon={School}
                    label="Student Number"
                    value={order?.studentNumber}
                  />
                  <InfoCard
                    icon={Building2}
                    label="Level"
                    value={order?.level}
                  />
                  <InfoCard
                    icon={Building2}
                    label="Department"
                    value={order?.department}
                  />
                  <InfoCard icon={Users} label="Gender" value={order?.gender} />
                </div>
              )}
            </div>

            {/* Empty Measurement Schedule */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("measurement")}
              >
                <SectionTitle>Measurement Schedule</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.measurement ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.measurement && (
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
                        {/* Add measurement reminders */}
                        <StatusMessage
                          type="warning"
                          title="Important Reminders"
                          steps={[
                            "Bring your valid School ID",
                            "Bring your payment receipt",
                            "Arrive on time for your schedule",
                          ]}
                          reminder="Please be present during your scheduled measurement."
                        />
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No measurement schedule set
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Empty Order Items */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("orderItems")}
              >
                <SectionTitle>Order Items</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.orderItems ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.orderItems && (
                <>
                  {order?.orderItems?.length > 0 ? (
                    <div className="space-y-3">
                      {order.orderItems.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Shirt className="h-5 w-5 text-primary" />
                                <span className="font-medium">
                                  {item.productType || "N/A"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">
                                  Size:
                                </div>
                                <div className="font-medium">
                                  {item.size || "N/A"}
                                </div>
                                <div className="text-muted-foreground">
                                  Quantity:
                                </div>
                                <div className="font-medium">
                                  {item.quantity || 0}
                                </div>
                                <div className="text-muted-foreground">
                                  Unit Price:
                                </div>
                                <div className="font-medium">
                                  ₱{(item.unitPrice || 0).toFixed(2)}
                                </div>
                                <div className="text-muted-foreground">
                                  Total:
                                </div>
                                <div className="font-medium text-primary">
                                  ₱
                                  {(
                                    (item.unitPrice || 0) * (item.quantity || 0)
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Overall Total */}
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center text-base font-semibold">
                            <span>Overall Total:</span>
                            <span className="text-primary text-lg">
                              ₱
                              {order.orderItems
                                .reduce(
                                  (total, item) =>
                                    total +
                                    (item.unitPrice || 0) *
                                      (item.quantity || 0),
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <EmptyState
                          icon={Receipt}
                          title="No Items"
                          description="No order items have been added yet."
                        />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Approved Status Flow */}
        {order?.status === "Approved" && (
          <>
            {/* Measurement Schedule */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("measurement")}
              >
                <SectionTitle>Measurement Schedule</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.measurement ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.measurement && (
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
                        {/* Add measurement reminders */}
                        <StatusMessage
                          type="warning"
                          title="Important Reminders"
                          steps={[
                            "Bring your valid School ID",
                            "Bring your payment receipt",
                            "Arrive on time for your schedule",
                          ]}
                          reminder="Please be present during your scheduled measurement."
                        />
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No measurement schedule set
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Receipts Section */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("receipts")}
              >
                <SectionTitle>Receipts</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.receipts ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.receipts && (
                <div className="space-y-4 pl-4 border-l border-border/50">
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

                  {!downPayment && !partialPayment && !fullPayment && (
                    <Card>
                      <CardContent className="p-6">
                        <EmptyState
                          icon={Receipt}
                          title="No Receipts"
                          description="No payment receipts have been added yet."
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Empty Order Items */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("orderItems")}
              >
                <SectionTitle>Order Items</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.orderItems ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.orderItems && (
                <>
                  {order?.orderItems?.length > 0 ? (
                    <div className="space-y-3">
                      {order.orderItems.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Shirt className="h-5 w-5 text-primary" />
                                <span className="font-medium">
                                  {item.productType || "N/A"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">
                                  Size:
                                </div>
                                <div className="font-medium">
                                  {item.size || "N/A"}
                                </div>
                                <div className="text-muted-foreground">
                                  Quantity:
                                </div>
                                <div className="font-medium">
                                  {item.quantity || 0}
                                </div>
                                <div className="text-muted-foreground">
                                  Unit Price:
                                </div>
                                <div className="font-medium">
                                  ₱{(item.unitPrice || 0).toFixed(2)}
                                </div>
                                <div className="text-muted-foreground">
                                  Total:
                                </div>
                                <div className="font-medium text-primary">
                                  ₱
                                  {(
                                    (item.unitPrice || 0) * (item.quantity || 0)
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Overall Total */}
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center text-base font-semibold">
                            <span>Overall Total:</span>
                            <span className="text-primary text-lg">
                              ₱
                              {order.orderItems
                                .reduce(
                                  (total, item) =>
                                    total +
                                    (item.unitPrice || 0) *
                                      (item.quantity || 0),
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <EmptyState
                          icon={Receipt}
                          title="No Items"
                          description="No order items have been added yet."
                        />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Student Info */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("studentInfo")}
              >
                <SectionTitle>Student Information</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.studentInfo ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.studentInfo && (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <InfoCard icon={User} label="Name" value={order?.name} />
                  <InfoCard icon={Mail} label="Email" value={order?.email} />
                  <InfoCard
                    icon={School}
                    label="Student Number"
                    value={order?.studentNumber}
                  />
                  <InfoCard
                    icon={Building2}
                    label="Level"
                    value={order?.level}
                  />
                  <InfoCard
                    icon={Building2}
                    label="Department"
                    value={order?.department}
                  />
                  <InfoCard icon={Users} label="Gender" value={order?.gender} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Measured Status Flow */}
        {order?.status === "Measured" && (
          <>
            {/* Order Items */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("orderItems")}
              >
                <SectionTitle>Order Items</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.orderItems ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.orderItems && (
                <>
                  {order?.orderItems?.length > 0 ? (
                    <div className="space-y-3">
                      {order.orderItems.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Shirt className="h-5 w-5 text-primary" />
                                <span className="font-medium">
                                  {item.productType || "N/A"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">
                                  Size:
                                </div>
                                <div className="font-medium">
                                  {item.size || "N/A"}
                                </div>
                                <div className="text-muted-foreground">
                                  Quantity:
                                </div>
                                <div className="font-medium">
                                  {item.quantity || 0}
                                </div>
                                <div className="text-muted-foreground">
                                  Unit Price:
                                </div>
                                <div className="font-medium">
                                  ₱{(item.unitPrice || 0).toFixed(2)}
                                </div>
                                <div className="text-muted-foreground">
                                  Total:
                                </div>
                                <div className="font-medium text-primary">
                                  ₱
                                  {(
                                    (item.unitPrice || 0) * (item.quantity || 0)
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Overall Total */}
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center text-base font-semibold">
                            <span>Overall Total:</span>
                            <span className="text-primary text-lg">
                              ₱
                              {order.orderItems
                                .reduce(
                                  (total, item) =>
                                    total +
                                    (item.unitPrice || 0) *
                                      (item.quantity || 0),
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <EmptyState
                          icon={Receipt}
                          title="No Items"
                          description="No order items have been added yet."
                        />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Measurement Schedule */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("measurement")}
              >
                <SectionTitle>Measurement Schedule</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.measurement ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.measurement && (
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
                        {/* Add measurement reminders */}
                        <StatusMessage
                          type="warning"
                          title="Important Reminders"
                          steps={[
                            "Bring your valid School ID",
                            "Bring your payment receipt",
                            "Arrive on time for your schedule",
                          ]}
                          reminder="Please be present during your scheduled measurement."
                        />
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No measurement schedule set
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Receipts Section */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("receipts")}
              >
                <SectionTitle>Receipts</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.receipts ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.receipts && (
                <div className="space-y-4 pl-4 border-l border-border/50">
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

                  {!downPayment && !partialPayment && !fullPayment && (
                    <Card>
                      <CardContent className="p-6">
                        <EmptyState
                          icon={Receipt}
                          title="No Receipts"
                          description="No payment receipts have been added yet."
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("studentInfo")}
              >
                <SectionTitle>Student Information</SectionTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {openSections.studentInfo ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {openSections.studentInfo && (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <InfoCard icon={User} label="Name" value={order?.name} />
                  <InfoCard icon={Mail} label="Email" value={order?.email} />
                  <InfoCard
                    icon={School}
                    label="Student Number"
                    value={order?.studentNumber}
                  />
                  <InfoCard
                    icon={Building2}
                    label="Level"
                    value={order?.level}
                  />
                  <InfoCard
                    icon={Building2}
                    label="Department"
                    value={order?.department}
                  />
                  <InfoCard icon={Users} label="Gender" value={order?.gender} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Order Timeline */}
        <div className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("timeline")}
          >
            <SectionTitle>Order Timeline</SectionTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {openSections.timeline ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {openSections.timeline && (
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
          )}
        </div>

        <ImageViewer
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          imageUrl={order?.receipt?.image?.data}
          title={`Receipt ${order?.receipt?.orNumber}`}
        />
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
