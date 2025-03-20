import { useState, useEffect } from "react";
import PrivateLayout from "../../PrivateLayout";
import { jobOrderAPI } from "../api/orderApi";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Receipt,
  Clock,
  CheckCircle2,
  Ruler,
  PackageCheck,
  ShoppingBag,
  Calendar,
  Building2,
  School,
  User,
  X,
  AlertCircle,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { toast } from "sonner";
import { OrderDetailsDialog } from "../components/order-details";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { DataTable } from "@/components/custom-components/DataTable";
import { formatDate } from "@/lib/utils";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { RejectDialog } from "@/components/custom-components/RejectDialog";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { ConfirmationDialog } from "@/components/custom-components/ConfirmationDialog";

// Status icon mapping
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

export function StudentOrders() {
  const [orders, setOrders] = useState([]);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiveLoading, setIsArchiveLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isArchiveActionLoading, setIsArchiveActionLoading] = useState(false);

  // Define tab configuration
  const tabConfig = [
    { value: "active", label: "Active Orders", icon: CheckCircle2 },
    { value: "archived", label: "Archived Orders", icon: Archive },
  ];

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await jobOrderAPI.getAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch archived orders
  const fetchArchivedOrders = async () => {
    try {
      setIsArchiveLoading(true);
      const data = await jobOrderAPI.getArchivedOrders();
      setArchivedOrders(data);
    } catch (error) {
      toast.error("Failed to fetch archived orders");
      console.error("Error fetching archived orders:", error);
    } finally {
      setIsArchiveLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchArchivedOrders();
  }, []);

  // Column definitions for table view
  const columns = [
    {
      key: "orderId",
      header: "Order ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "name",
      header: "Student Name",
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "studentNumber",
      header: "Student Number",
      render: (value) => (
        <div className="flex items-center gap-2">
          <School className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <StatusBadge status={value} icon={STATUS_ICONS[value]} />
      ),
    },
  ];

  // Action handlers
  const handleView = (row) => {
    setSelectedOrder(row);
    setIsViewDialogOpen(true);
  };

  // Add a handler for order updates
  const handleOrderUpdate = (updatedOrder) => {
    // Update the selected order
    setSelectedOrder(updatedOrder);
    // Update the orders list
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
  };

  const handleReject = async (reason) => {
    try {
      await jobOrderAPI.rejectOrder(selectedOrder._id, reason);
      toast.success("Order rejected successfully");
      setRejectDialogOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to reject order");
      console.error("Error rejecting order:", error);
    }
  };

  const handleArchiveConfirm = async () => {
    try {
      setIsArchiveActionLoading(true);
      const response = await jobOrderAPI.toggleArchive(selectedOrder._id);
      toast.success(response.message);
      
      // Refresh both active and archived orders
      fetchOrders();
      fetchArchivedOrders();
      setArchiveDialogOpen(false);
    } catch (error) {
      toast.error("Failed to archive order");
      console.error("Error archiving order:", error);
    } finally {
      setIsArchiveActionLoading(false);
    }
  };

  const handleArchiveClick = (order) => {
    setSelectedOrder(order);
    setArchiveDialogOpen(true);
  };

  // Define actions for the active orders table
  const activeOrderActions = {
    view: {
      label: "View Actions",
      actions: [
        {
          label: "View Details",
          icon: Eye,
          onClick: handleView,
        },
      ],
    },
    archive: {
      label: "Archive Actions",
      actions: [
        {
          label: "Archive Order",
          icon: Archive,
          onClick: handleArchiveClick,
        },
      ],
    },
  };

  // Define actions for the archived orders table
  const archivedOrderActions = {
    view: {
      label: "View Actions",
      actions: [
        {
          label: "View Details",
          icon: Eye,
          onClick: handleView,
        },
      ],
    },
    restore: {
      label: "Archive Actions",
      actions: [
        {
          label: "Restore Order",
          icon: ArchiveRestore,
          onClick: handleArchiveClick,
        },
      ],
    },
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Student Orders Management"
          description="View and manage student uniform orders"
        />

        <CustomTabs
          defaultValue="active"
          onValueChange={setActiveTab}
          tabs={tabConfig}
        >
          <TabPanel value="active">
            <DataTable
              className="mt-4"
              data={orders}
              columns={columns}
              isLoading={isLoading}
              actionCategories={activeOrderActions}
              emptyMessage="No active orders found."
            />
          </TabPanel>
          
          <TabPanel value="archived">
            <DataTable
              className="mt-4"
              data={archivedOrders}
              columns={columns}
              isLoading={isArchiveLoading}
              actionCategories={archivedOrderActions}
              emptyMessage="No archived orders found."
            />
          </TabPanel>
        </CustomTabs>

        {/* View Order Dialog */}
        <OrderDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          order={selectedOrder}
          onUpdate={handleOrderUpdate}
        />

        {/* Add Reject Dialog */}
        <RejectDialog
          isOpen={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          onConfirm={handleReject}
          title={`Reject Order ${selectedOrder?.orderId}`}
        />

        {/* Archive Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={archiveDialogOpen}
          onClose={() => setArchiveDialogOpen(false)}
          onConfirm={handleArchiveConfirm}
          title={selectedOrder?.isArchived ? "Restore Order" : "Archive Order"}
          description={
            selectedOrder?.isArchived
              ? `Are you sure you want to restore order ${selectedOrder?.orderId}?`
              : `Are you sure you want to archive order ${selectedOrder?.orderId}?`
          }
          confirmText={selectedOrder?.isArchived ? "Restore" : "Archive"}
          isLoading={isArchiveActionLoading}
          variant={selectedOrder?.isArchived ? "success" : "default"}
          icon={selectedOrder?.isArchived ? ArchiveRestore : Archive}
        />
      </div>
    </PrivateLayout>
  );
}
