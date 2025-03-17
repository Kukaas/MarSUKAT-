import { formatDate, cn } from "@/lib/utils";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { ImageViewer } from "@/components/custom-components/ImageViewer";
import { toast } from "sonner";
import { jobOrderAPI } from "../api/orderApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { ConfirmationDialog } from "@/components/custom-components/ConfirmationDialog";
import { Textarea } from "@/components/ui/textarea";
import { RejectDialog } from "@/components/custom-components/RejectDialog";
import { StatusMessage } from "@/components/custom-components/StatusMessage";

const STATUS_ICONS = {
  Pending: Clock,
  Approved: CheckCircle2,
  Measured: Ruler,
  "For Pickup": PackageCheck,
  Claimed: ShoppingBag,
  Rejected: AlertCircle,
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

// Add this helper function at the top level
const getAvailableStatuses = (currentStatus) => {
  switch (currentStatus) {
    case "Pending":
      return ["Pending", "Approved", "Rejected"];
    case "Approved":
      return ["Approved", "Measured", "Rejected"];
    case "Measured":
      return ["Measured", "For Pickup", "Rejected"];
    case "For Pickup":
      return ["For Pickup", "Claimed", "Rejected"];
    case "Claimed":
      return ["Claimed"];
    case "Rejected":
      return ["Rejected"];
    default:
      return [];
  }
};

function OrderContent({ order, onUpdate }) {
  const [openSections, setOpenSections] = useState({});
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    data: null,
  });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Get available statuses based on current status
  const availableStatuses = getAvailableStatuses(order?.status);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === "Rejected") {
      setRejectDialogOpen(true);
    }
    setSelectedStatus(newStatus);
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      const updatedOrder = await jobOrderAPI.updateOrder(order._id, {
        status: selectedStatus,
      });
      toast.success("Order status updated successfully");
      onUpdate && onUpdate(updatedOrder);
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
      setConfirmDialog({ isOpen: false, type: null, data: null });
    }
  };

  const handleVerifyReceipt = async (verified) => {
    try {
      setIsUpdating(true);
      const updatedOrder = await jobOrderAPI.updateOrder(order._id, {
        "receipt.isVerified": verified,
      });
      toast.success(
        verified
          ? "Receipt verified successfully"
          : "Receipt marked as unverified"
      );
      onUpdate && onUpdate(updatedOrder);
    } catch (error) {
      toast.error("Failed to update receipt verification");
      console.error("Error updating receipt verification:", error);
    } finally {
      setIsUpdating(false);
      setConfirmDialog({ isOpen: false, type: null, data: null });
    }
  };

  const handleRejectOrder = async (reason) => {
    try {
      setIsUpdating(true);
      const updatedOrder = await jobOrderAPI.rejectOrder(order._id, reason);
      toast.success("Order rejected successfully");
      onUpdate && onUpdate(updatedOrder);
    } catch (error) {
      toast.error("Failed to reject order");
      console.error("Error rejecting order:", error);
    } finally {
      setIsUpdating(false);
      setRejectDialogOpen(false);
    }
  };

  const openStatusConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      type: "status",
      data: selectedStatus,
    });
  };

  const openVerifyConfirmation = (verified) => {
    setConfirmDialog({
      isOpen: true,
      type: "verify",
      data: verified,
    });
  };

  const openRejectConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      type: "reject",
      data: null,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, type: null, data: null });
  };

  // Add helper function to check if order is rejected
  const isRejected = order?.status === "Rejected";

  const getStatusConfirmationDetails = () => {
    if (selectedStatus === "Approved") {
      return {
        title: "Approve Order",
        description: (
          <div className="space-y-2">
            <p>Have you verified the following receipt information?</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>OR Number: {order?.receipt?.orNumber}</li>
              <li>Amount: ₱{order?.receipt?.amount.toFixed(2)}</li>
              <li>Date Paid: {formatDate(order?.receipt?.datePaid)}</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Approving this order will:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>Verify the receipt automatically</li>
              <li>Schedule the student for measurement</li>
              <li>Send notification to the student</li>
            </ul>
          </div>
        ),
        confirmText: "Approve Order",
        variant: "success",
        icon: CheckCircle2,
      };
    }

    return {
      title: "Update Order Status",
      description: `Are you sure you want to update the order status to "${selectedStatus}"?`,
      confirmText: "Update Status",
      variant: "default",
      icon: AlertCircle,
    };
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Order Status Management */}
        <div className="relative">
          <div className="absolute inset-0 h-40 sm:h-44 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4 ring-4 ring-background shadow-xl">
              <Receipt className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                  {order?.orderId}
                </h3>
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
                />
              )}

              {/* Status Management - Disable when rejected */}
              <div className="flex gap-2 items-center justify-center">
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusChange}
                  disabled={isRejected}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="Pending"
                      disabled={!availableStatuses.includes("Pending")}
                    >
                      Pending
                    </SelectItem>
                    <SelectItem
                      value="Approved"
                      disabled={!availableStatuses.includes("Approved")}
                    >
                      Approved
                    </SelectItem>
                    <SelectItem
                      value="Measured"
                      disabled={!availableStatuses.includes("Measured")}
                    >
                      Measured
                    </SelectItem>
                    <SelectItem
                      value="For Pickup"
                      disabled={!availableStatuses.includes("For Pickup")}
                    >
                      For Pickup
                    </SelectItem>
                    <SelectItem
                      value="Claimed"
                      disabled={!availableStatuses.includes("Claimed")}
                    >
                      Claimed
                    </SelectItem>
                    <SelectItem
                      value="Rejected"
                      className="text-destructive dark:text-red-400"
                      disabled={!availableStatuses.includes("Rejected")}
                    >
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={openStatusConfirmation}
                  disabled={
                    isUpdating ||
                    selectedStatus === order?.status ||
                    rejectDialogOpen ||
                    isRejected
                  }
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
              </div>
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
        <div className="space-y-4">
          <SectionTitle>Student Information</SectionTitle>
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

        {/* Receipt Information */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <SectionTitle>Receipt Information</SectionTitle>
            {!isRejected && (
              <StatusBadge
                status={order?.receipt?.isVerified ? "Verified" : "Pending"}
                icon={order?.receipt?.isVerified ? CheckCircle2 : Clock}
              />
            )}
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    OR Number
                  </p>
                  <p className="font-medium">{order?.receipt?.orNumber}</p>
                </div>
                <Button
                  variant={order?.receipt?.isVerified ? "outline" : "default"}
                  size="sm"
                  onClick={() => openVerifyConfirmation(true)}
                  disabled={
                    isUpdating || order?.receipt?.isVerified || isRejected
                  }
                >
                  <Check className="h-4 w-4 mr-2" />
                  Verify Receipt
                </Button>
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <InfoCard
                  icon={Receipt}
                  label="Amount"
                  value={`₱${order?.receipt?.amount.toFixed(2)}`}
                />
                <InfoCard
                  icon={Calendar}
                  label="Date Paid"
                  value={formatDate(order?.receipt?.datePaid)}
                />
              </div>

              {/* Update Verification Status Messages */}
              {order?.receipt?.isVerified ? (
                <StatusMessage
                  type="success"
                  title="Receipt Verified"
                  message="Payment has been verified and order has been approved"
                />
              ) : !isRejected ? (
                <StatusMessage
                  type="warning"
                  title="Receipt Pending Verification"
                  steps={[
                    "Approve the order automatically",
                    "Schedule the student for measurement",
                    "Send notification to the student",
                  ]}
                  message="Verifying this receipt will:"
                />
              ) : null}

              {/* Receipt Image section */}
              {order?.receipt?.image?.data && (
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
                      src={order.receipt.image.data}
                      alt="Receipt"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Timeline */}
        <div className="space-y-4">
          <SectionTitle>Order Timeline</SectionTitle>
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

        <ImageViewer
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          imageUrl={order?.receipt?.image?.data}
          title={`Receipt ${order?.receipt?.orNumber}`}
        />

        {/* Update Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen && confirmDialog.type === "status"}
          onClose={closeConfirmDialog}
          onConfirm={handleStatusUpdate}
          {...getStatusConfirmationDetails()}
          isLoading={isUpdating}
        />

        <ConfirmationDialog
          isOpen={confirmDialog.isOpen && confirmDialog.type === "verify"}
          onClose={closeConfirmDialog}
          onConfirm={() => handleVerifyReceipt(confirmDialog.data)}
          title="Verify Receipt"
          description={
            <div className="space-y-2">
              <p>Are you sure you want to verify this receipt?</p>
              <p className="text-sm text-muted-foreground">This will:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li>Approve the order automatically</li>
                <li>Schedule the student for measurement</li>
                <li>Send notification to the student</li>
              </ul>
            </div>
          }
          confirmText="Verify Receipt"
          variant="success"
          icon={CheckCircle2}
          isLoading={isUpdating}
        />

        <RejectDialog
          isOpen={rejectDialogOpen}
          onClose={() => {
            setRejectDialogOpen(false);
            setSelectedStatus(order?.status);
          }}
          onConfirm={handleRejectOrder}
          title={`Reject Order ${order?.orderId}`}
          isLoading={isUpdating}
        />
      </div>
    </ScrollArea>
  );
}

export function OrderDetailsDialog({ isOpen, onClose, order, onUpdate }) {
  if (!order) return null;

  return (
    <ViewDetailsDialog open={isOpen} onClose={onClose} title="Order Details">
      <OrderContent order={order} onUpdate={onUpdate} />
    </ViewDetailsDialog>
  );
}
