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
  Plus,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "@/components/custom-components/ImageViewer";
import { StatusMessage } from "@/components/custom-components/StatusMessage";
import EmptyState from "@/components/custom-components/EmptyState";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { orderAPI } from "../api/orderApi";
import { toast } from "sonner";
import ReceiptForm from "../forms/ReceiptForm";

// Add status icons mapping
const STATUS_ICONS = {
  Rejected: AlertCircle,
  Pending: Clock,
  Approved: CheckCircle2,
  Measured: Ruler,
  "For Pickup": PackageCheck,
  Claimed: ShoppingBag,
  "For Verification": Clock,
  "Payment Verified": CheckCircle2,
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

function OrderContent({ order, onOrderUpdate }) {
  // Update initial section states based on status
  const [openSections, setOpenSections] = useState(() => {
    switch (order?.status) {
      case "Pending":
        return {
          receipts: true,
          studentInfo: false,
          measurement: false,
          orderItems: false,
          timeline: false,
        };
      case "Approved":
        return {
          measurement: true,
          receipts: false,
          orderItems: false,
          studentInfo: false,
          timeline: false,
        };
      case "Measured":
        return {
          orderItems: true,
          measurement: false,
          receipts: false,
          studentInfo: false,
          timeline: false,
        };
      case "For Verification":
        return {
          receipts: true,
          orderItems: false,
          measurement: false,
          studentInfo: false,
          timeline: false,
        };
      default:
        return {
          receipts: false,
          orderItems: false,
          measurement: false,
          studentInfo: false,
          timeline: false,
        };
    }
  });
  // Add state for image viewer
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  // Add new state for receipt dialog
  const [isAddReceiptDialogOpen, setIsAddReceiptDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingReceipt, setIsValidatingReceipt] = useState(false);
  // Add new state for editing receipt
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [isEditReceiptDialogOpen, setIsEditReceiptDialogOpen] = useState(false);
  // Add state for current image being viewed
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [currentImageTitle, setCurrentImageTitle] = useState("");

  // Toggle section
  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Add handler for receipt submission
  const handleAddReceipt = async (data) => {
    try {
      setIsSubmitting(true);
      await orderAPI.addReceipt(order._id, data);
      toast.success("Receipt added successfully");
      setIsAddReceiptDialogOpen(false);
      // Notify parent component to refresh order data
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error("Error adding receipt:", error);
      toast.error(error.response?.data?.message || "Failed to add receipt");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add handler for receipt validation state change
  const handleValidationStateChange = (validating) => {
    setIsValidatingReceipt(validating);
  };

  // Add handler for receipt edit submission
  const handleEditReceipt = async (data) => {
    try {
      setIsSubmitting(true);
      await orderAPI.updateReceipt(order._id, editingReceipt._id, data.receipt);
      toast.success("Receipt updated successfully");
      setIsEditReceiptDialogOpen(false);
      setEditingReceipt(null);
      // Notify parent component to refresh order data
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error("Error updating receipt:", error);
      toast.error(error.response?.data?.message || "Failed to update receipt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReceiptSection = (receipts) => {
    if (!receipts || receipts.length === 0) return null;

    return receipts.map((receipt, index) => {
      const isOpen = openSections[`receipt-${index}`];

      return (
        <div key={index} className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection(`receipt-${index}`)}
          >
            <div className="flex items-center justify-between flex-1">
              <h4 className="text-sm font-medium">{`${receipt.type} Receipt`}</h4>
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
                  
                  {/* Only show edit button for unverified receipts that are NOT Down Payment */}
                  {!receipt.isVerified && receipt.type !== "Down Payment" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingReceipt(receipt);
                        setIsEditReceiptDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
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

                {receipt.isVerified ? (
                  receipt.type === "Full Payment" ? (
                    <StatusMessage
                      type="success"
                      title="Full Payment Verified"
                      message="Your full payment has been verified. Thank you for completing your payment!"
                    />
                  ) : (
                    <StatusMessage
                      type="success"
                      title="Receipt Verified"
                      message="Payment has been verified and order has been approved"
                    />
                  )
                ) : (
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
                      onClick={() => {
                        setImageViewerOpen(true);
                        // Update the image URL to the current receipt being viewed
                        setCurrentImageUrl(receipt.image.data);
                        setCurrentImageTitle(`Receipt ${receipt.orNumber}`);
                      }}
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
    });
  };

  // Helper function to get section order based on status
  const getSectionOrder = () => {
    switch (order?.status) {
      case "Pending":
        return [
          "receipts",
          "studentInfo",
          "measurement",
          "orderItems",
          "timeline",
        ];
      case "Approved":
        return [
          "measurement",
          "receipts",
          "orderItems",
          "studentInfo",
          "timeline",
        ];
      case "Measured":
        return [
          "orderItems",
          "measurement",
          "receipts",
          "studentInfo",
          "timeline",
        ];
      case "For Verification":
        return [
          "receipts",
          "orderItems",
          "measurement",
          "studentInfo",
          "timeline",
        ];
      default:
        return [
          "receipts",
          "orderItems",
          "measurement",
          "studentInfo",
          "timeline",
        ];
    }
  };

  // Add status message for For Verification
  const renderStatusMessage = () => {
    switch (order?.status) {
      case "Rejected":
        return (
          order?.rejectionReason && (
            <StatusMessage
              type="rejected"
              title="Order Rejected"
              message={order.rejectionReason}
              reminder="Please contact the office for more information or to submit a new order."
            />
          )
        );
      case "Pending":
        return (
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
        );
      case "Approved":
        return (
          <StatusMessage
            type="success"
            title="Order Approved"
            message="Your payment has been verified."
            reminder="Please wait for your measurement schedule."
          />
        );
      case "For Verification":
        return (
          <StatusMessage
            type="warning"
            title="Receipt Under Verification"
            message="Your payment receipt is being reviewed."
            steps={[
              "Verify payment details",
              "Update order status",
              "Send notification once verified",
            ]}
          />
        );
      case "Payment Verified":
        return (
          <StatusMessage
            type="info"
            title="Payment Verified"
            message="Your payment has been verified. Please proceed to the garments section to claim your order."
            reminder="Remember to bring your down payment and full payment receipts along with your school ID."
          />
        );
      case "Claimed":
        return (
          <StatusMessage
            type="success"
            title="Order Successfully Claimed"
            message="Thank you for claiming your order. We hope you enjoy your uniform!"
          />
        );
      default:
        return null;
    }
  };

  // Add section render functions
  const renderOrderItemsSection = () => (
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
                        <div className="text-muted-foreground">Size:</div>
                        <div className="font-medium">{item.size || "N/A"}</div>
                        <div className="text-muted-foreground">Quantity:</div>
                        <div className="font-medium">{item.quantity || 0}</div>
                        <div className="text-muted-foreground">Unit Price:</div>
                        <div className="font-medium">
                          ₱{(item.unitPrice || 0).toFixed(2)}
                        </div>
                        <div className="text-muted-foreground">Total:</div>
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
                            (item.unitPrice || 0) * (item.quantity || 0),
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
  );

  const renderMeasurementSection = () => (
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
                  <span className="font-semibold">Scheduled Measurement</span>
                </div>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <InfoCard
                    icon={Calendar}
                    label="Date"
                    value={formatDate(order.measurementSchedule.date, "long")}
                  />
                  <InfoCard
                    icon={Clock}
                    label="Time"
                    value={order.measurementSchedule.time}
                  />
                </div>
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
  );

  const renderStudentInfoSection = () => (
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
          <InfoCard icon={Building2} label="Level" value={order?.level} />
          <InfoCard
            icon={Building2}
            label="Department"
            value={order?.department}
          />
          <InfoCard icon={Users} label="Gender" value={order?.gender} />
        </div>
      )}
    </div>
  );

  const renderTimelineSection = () => (
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
  );

  const renderReceiptsSection = () => (
    <div className="space-y-4">
      {/* For Pickup Payment Section - Show at top when status is "For Pickup" */}
      {order?.status === "For Pickup" && (
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-primary">
                <Receipt className="h-5 w-5" />
                <span className="font-semibold">Payment Required</span>
              </div>
              <Button
                onClick={() => setIsAddReceiptDialogOpen(true)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Receipt
              </Button>
            </div>
            <StatusMessage
              type="warning"
              title="Payment Required"
              message="Please submit your payment receipt to proceed with the pickup."
              steps={[
                "Make the payment at the cashier",
                "Upload the receipt",
                "Wait for verification",
              ]}
            />
          </CardContent>
        </Card>
      )}

      {/* Receipts List Section */}
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
          {order?.receipts?.length > 0 ? (
            renderReceiptSection(order.receipts)
          ) : (
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
  );

  // Update renderSections to use the new consolidated receiptsSection
  const renderSections = () => {
    const sections = {
      receipts: renderReceiptsSection(),
      orderItems: renderOrderItemsSection(),
      measurement: renderMeasurementSection(),
      studentInfo: renderStudentInfoSection(),
      timeline: renderTimelineSection(),
    };

    return getSectionOrder().map((sectionKey) => sections[sectionKey]);
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8 p-4">
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
              {renderStatusMessage()}
            </div>
          </div>
        </div>

        {/* Render sections in order */}
        {renderSections()}

        {/* Keep the dialogs */}
        <AlertDialog open={isAddReceiptDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px] h-[90vh] sm:h-[90vh] flex flex-col gap-0">
            <AlertDialogHeader className="flex-none">
              <AlertDialogTitle>Add New Receipt</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide the payment receipt details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="px-5 py-4">
                  <ReceiptForm
                    order={order}
                    onSubmit={handleAddReceipt}
                    isSubmitting={isSubmitting}
                    onValidationStateChange={handleValidationStateChange}
                  />
                </div>
              </ScrollArea>
            </div>
            <AlertDialogFooter className="flex-none border-t pt-4">
              <AlertDialogCancel
                onClick={() =>
                  !isSubmitting && setIsAddReceiptDialogOpen(false)
                }
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="receiptForm"
                disabled={isSubmitting || isValidatingReceipt}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Adding...
                  </>
                ) : (
                  "Add Receipt"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Edit Receipt Dialog */}
        <AlertDialog open={isEditReceiptDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px] h-[90vh] sm:h-[90vh] flex flex-col gap-0">
            <AlertDialogHeader className="flex-none">
              <AlertDialogTitle>Edit Receipt</AlertDialogTitle>
              <AlertDialogDescription>
                Update the receipt information
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="px-5 py-4">
                  <ReceiptForm
                    order={order}
                    existingReceipt={editingReceipt}
                    onSubmit={handleEditReceipt}
                    isSubmitting={isSubmitting}
                    onValidationStateChange={handleValidationStateChange}
                    isEditing={true}
                  />
                </div>
              </ScrollArea>
            </div>
            <AlertDialogFooter className="flex-none border-t pt-4">
              <AlertDialogCancel
                onClick={() =>
                  !isSubmitting && setIsEditReceiptDialogOpen(false)
                }
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="receiptForm"
                disabled={isSubmitting || isValidatingReceipt}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update Receipt"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Update Image Viewer to use currentImageUrl */}
        <ImageViewer
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          imageUrl={currentImageUrl}
          title={currentImageTitle}
        />
      </div>
    </ScrollArea>
  );
}

export function OrderDetailsDialog({ isOpen, onClose, order, onOrderUpdate }) {
  if (!order) return null;

  return (
    <ViewDetailsDialog open={isOpen} onClose={onClose} title="Order Details">
      <OrderContent order={order} onOrderUpdate={onOrderUpdate} />
    </ViewDetailsDialog>
  );
}
