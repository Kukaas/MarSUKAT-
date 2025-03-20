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
  Shirt,
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
import { OrderMeasurementForm } from "../forms/OrderMeasurementForm";
import EmptyState from "@/components/custom-components/EmptyState";

const STATUS_ICONS = {
  Pending: Clock,
  Approved: CheckCircle2,
  Measured: Ruler,
  "For Pickup": PackageCheck,
  Claimed: ShoppingBag,
  Rejected: AlertCircle,
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

const getAvailableStatuses = (currentStatus) => {
  switch (currentStatus) {
    case "Pending":
      return ["Pending", "Approved", "Reject"];
    case "Approved":
      return ["Approved", "Measure"];
    case "Measured":
      return ["Measured", "For Pickup"];
    case "For Pickup":
      return ["For Pickup", "Claimed"];
    case "For Verification":
      return ["For Verification", "Verify"];
    case "Payment Verified":
      return ["Payment Verified", "Claimed"];
    case "Claimed":
      return ["Claimed"];
    case "Rejected":
      return ["Rejected"];
    default:
      return [];
  }
};

function OrderContent({ order, onUpdate }) {
  const getReceiptsByType = (type) => {
    if (!order?.receipts || order.receipts.length === 0) return null;
    return order.receipts.find((receipt) => receipt.type === type) || null;
  };

  const [openSections, setOpenSections] = useState({
    receipts: order?.status === "Pending",
    studentInfo: false,
    measurementSchedule: order?.status === "Approved",
    orderItems: order?.status === "Measured",
    timeline: false,
  });
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    data: null,
  });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);

  const availableStatuses = getAvailableStatuses(order?.status);

  const downPayment = getReceiptsByType("Down Payment");
  const partialPayment = getReceiptsByType("Partial Payment");
  const fullPayment = getReceiptsByType("Full Payment");

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === "Rejected") {
      setRejectDialogOpen(true);
      setSelectedStatus(newStatus);
    } else if (newStatus === "Measure") {
      setShowMeasurementForm(true);
      setSelectedStatus("Approved");
    } else {
      setSelectedStatus(newStatus);
    }
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
      // Check if it's an inventory error
      if (error.response?.data?.error?.includes("Insufficient inventory")) {
        toast.error(
          error.response.data.error
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update order status"
        );
      }
      // Reset selected status on error
      setSelectedStatus(order?.status);
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
      setConfirmDialog({ isOpen: false, type: null, data: null });
    }
  };

  const handleVerifyReceipt = async (receiptId) => {
    try {
      setIsUpdating(true);
      const updatedOrder = await jobOrderAPI.verifyReceipt(
        order._id,
        receiptId
      );
      toast.success("Receipt verified successfully");
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

  const openVerifyConfirmation = (receiptId, receipt) => {
    setConfirmDialog({
      isOpen: true,
      type: "verify",
      data: { id: receiptId, type: receipt.type, amount: receipt.amount },
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

  const isRejected = order?.status === "Rejected";

  const getStatusConfirmationDetails = () => {
    if (selectedStatus === "Approved") {
      const latestReceipt = order.receipts[order.receipts.length - 1];
      return {
        title: "Approve Order",
        description: (
          <div className="space-y-2">
            <p>Have you verified the following receipt information?</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>OR Number: {latestReceipt?.orNumber}</li>
              <li>Amount: ₱{latestReceipt?.amount.toFixed(2)}</li>
              <li>Date Paid: {formatDate(latestReceipt?.datePaid)}</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              {order.status === "For Verification"
                ? "Approving this order will:"
                : "Approving this order will:"}
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              {order.status === "For Verification" ? (
                <>
                  <li>Verify the receipt</li>
                  <li>Update order status</li>
                  <li>Send notification to the student</li>
                </>
              ) : (
                <>
                  <li>Verify the receipt automatically</li>
                  <li>Schedule the student for measurement</li>
                  <li>Send notification to the student</li>
                </>
              )}
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

  const handleMeasurementSubmit = async (data) => {
    try {
      setIsUpdating(true);
      const updatedOrder = await jobOrderAPI.addOrderItemsAndMeasure(
        order._id,
        data.orderItems.map((item) => ({
          ...item,
          level: order.level,
        }))
      );
      toast.success("Measurements saved successfully");
      onUpdate && onUpdate(updatedOrder);
      setShowMeasurementForm(false);
      setSelectedStatus("Measured");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save measurements"
      );
      console.error("Error saving measurements:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderReceiptContent = (receipt) => (
    <>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">OR Number</p>
          <p className="font-medium">{receipt.orNumber}</p>
        </div>
        <Button
          variant={receipt.isVerified ? "outline" : "default"}
          size="sm"
          onClick={() => openVerifyConfirmation(receipt._id, receipt)}
          disabled={isUpdating || receipt.isVerified || isRejected}
        >
          <Check className="h-4 w-4 mr-2" />
          Verify Receipt
        </Button>
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
            message="The full payment has been verified. Please proceed with the next steps in the order process."
          />
        ) : (
          <StatusMessage
            type="success"
            title="Receipt Verified"
            message="Payment has been verified and order has been approved"
          />
        )
      ) : !isRejected ? (
        <StatusMessage
          type="warning"
          title="Receipt Pending Verification"
          steps={
            order.status === "For Verification"
              ? [
                  "Verify the receipt",
                  "Update order status",
                  "Send notification to the student",
                ]
              : [
                  "Approve the order automatically",
                  "Schedule the student for measurement",
                  "Send notification to the student",
                ]
          }
          message="Verifying this receipt will:"
        />
      ) : null}

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
    </>
  );

  const renderReceiptSections = () => {
    if (!order?.receipts || order.receipts.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Receipt}
              title="No Receipts"
              description="No payment receipts have been added yet."
            />
          </CardContent>
        </Card>
      );
    }

    return order.receipts.map((receipt, index) => (
      <div key={receipt._id || index} className="space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection(`receipt-${index}`)}
        >
          <div className="flex items-center justify-between flex-1">
            <h4 className="text-sm font-medium">{receipt.type} Receipt</h4>
            {!isRejected && (
              <StatusBadge
                status={receipt.isVerified ? "Verified" : "Pending"}
                icon={receipt.isVerified ? CheckCircle2 : Clock}
              />
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {openSections[`receipt-${index}`] ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {openSections[`receipt-${index}`] && (
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              {renderReceiptContent(receipt)}
            </CardContent>
          </Card>
        )}
      </div>
    ));
  };

  const renderOrderSections = () => {
    const sections = [];

    if (order?.status === "Pending") {
      sections.push(
        <div key="receipts-priority" className="space-y-4">
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
              {renderReceiptSections()}
            </div>
          )}
        </div>
      );
    } else if (order?.status === "Approved") {
      sections.push(
        <div key="measurementSchedule-priority" className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("measurementSchedule")}
          >
            <SectionTitle>Measurement Schedule</SectionTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {openSections.measurementSchedule ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          {openSections.measurementSchedule && renderMeasurementSchedule()}
        </div>
      );
    } else if (order?.status === "Measured") {
      sections.push(
        <div key="orderItems-priority" className="space-y-4">
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
          {openSections.orderItems && renderOrderItems()}
        </div>
      );
    }

    if (order?.status !== "Pending") {
      sections.push(
        <div key="receipts" className="space-y-4">
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
              {renderReceiptSections()}
            </div>
          )}
        </div>
      );
    }

    if (order?.status !== "Approved") {
      sections.push(
        <div key="measurementSchedule" className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("measurementSchedule")}
          >
            <SectionTitle>Measurement Schedule</SectionTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {openSections.measurementSchedule ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          {openSections.measurementSchedule && renderMeasurementSchedule()}
        </div>
      );
    }

    if (order?.status !== "Measured") {
      sections.push(
        <div key="orderItems" className="space-y-4">
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
          {openSections.orderItems && renderOrderItems()}
        </div>
      );
    }

    sections.push(
      <div key="studentInfo" className="space-y-4">
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
        {openSections.studentInfo && renderStudentInfo()}
      </div>,
      <div key="timeline" className="space-y-4">
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
        {openSections.timeline && renderTimeline()}
      </div>
    );

    return sections;
  };

  const renderHeader = () => (
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

          {isRejected && order?.rejectionReason && (
            <StatusMessage
              type="rejected"
              title="Order Rejected"
              message={order.rejectionReason}
            />
          )}

          <div className="flex gap-2 items-center justify-center">
            <Select
              value={selectedStatus}
              onValueChange={handleStatusChange}
              disabled={isRejected || order?.status === "Claimed"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={
                    order?.status === "Approved"
                      ? "Select action"
                      : order?.status === "Claimed"
                      ? "Order completed"
                      : "Select status"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className={
                      status === "Rejected"
                        ? "text-destructive dark:text-red-400"
                        : ""
                    }
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={openStatusConfirmation}
              disabled={
                isUpdating ||
                selectedStatus === order?.status ||
                rejectDialogOpen ||
                isRejected ||
                order?.status === "Claimed"
              }
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMeasurementForm = () => (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Add Measurements</h3>
        <StatusMessage
          type="info"
          title="Add Order Items"
          message="Please manage your order items using the buttons below"
          steps={[
            "Click 'Add Item' button to add a new item",
            "Fill in the measurements for each item",
            "Click 'Remove' button to delete an unwanted item",
            "Review all items before submitting",
          ]}
        />
        <OrderMeasurementForm
          onSubmit={handleMeasurementSubmit}
          isSubmitting={isUpdating}
          studentLevel={order.level}
        />
      </CardContent>
    </Card>
  );

  const renderStudentInfo = () => (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
      <InfoCard icon={User} label="Name" value={order?.name} />
      <InfoCard icon={Mail} label="Email" value={order?.email} />
      <InfoCard
        icon={School}
        label="Student Number"
        value={order?.studentNumber}
      />
      <InfoCard icon={Building2} label="Level" value={order?.level} />
      <InfoCard icon={Building2} label="Department" value={order?.department} />
      <InfoCard icon={Users} label="Gender" value={order?.gender} />
    </div>
  );

  const renderTimeline = () => (
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
  );

  const renderMeasurementSchedule = () => (
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
            {order.status === "Measured" && (
              <StatusMessage
                type="success"
                title="Measurements Completed"
                message="Student measurements have been recorded."
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
  );

  const renderOrderItems = () => (
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
                      {((item.unitPrice || 0) * (item.quantity || 0)).toFixed(
                        2
                      )}
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
                        total + (item.unitPrice || 0) * (item.quantity || 0),
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
              icon={Shirt}
              title="No Items"
              description="No order items have been added yet."
            />
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderDialogs = () => (
    <>
      <ImageViewer
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={
          order?.receipts?.length > 0
            ? order.receipts[order.receipts.length - 1]?.image?.data
            : null
        }
        title={`Receipt ${
          order?.receipts?.length > 0
            ? order.receipts[order.receipts.length - 1]?.orNumber
            : ""
        }`}
      />

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
        onConfirm={() => handleVerifyReceipt(confirmDialog.data.id)}
        title="Verify Receipt"
        description={
          <div className="space-y-2">
            <p>Are you sure you want to verify this receipt?</p>
            {confirmDialog.data?.type === "Down Payment" ? (
              <>
                <p className="text-sm text-muted-foreground mt-4">
                  This is a down payment receipt for ₱{confirmDialog.data.amount?.toFixed(2)}. 
                  Verifying this receipt will:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>Mark the receipt as verified</li>
                  <li>Automatically approve the order</li>
                  <li>Schedule the student for measurement</li>
                  <li>Send notification to the student about the schedule</li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mt-4">
                  Verifying this receipt will:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>Mark the receipt as verified</li>
                  <li>Update payment status</li>
                  <li>Send notification to the student</li>
                </ul>
              </>
            )}
          </div>
        }
        confirmText={
          confirmDialog.data?.type === "Down Payment" 
            ? "Verify and Approve Order" 
            : "Verify Receipt"
        }
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
    </>
  );

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8">
        {renderHeader()}

        {showMeasurementForm && renderMeasurementForm()}

        {renderOrderSections()}

        {renderDialogs()}
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
