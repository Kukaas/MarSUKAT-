import { useState } from "react";
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
import { OrderDetailsDialog } from "../components/details/order-details";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { DataTable } from "@/components/custom-components/DataTable";
import { formatDate } from "@/lib/utils";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { RejectDialog } from "@/components/custom-components/RejectDialog";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { ConfirmationDialog } from "@/components/custom-components/ConfirmationDialog";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  // Define tab configuration
  const tabConfig = [
    { value: "active", label: "Active Orders", icon: CheckCircle2 },
    { value: "archived", label: "Archived Orders", icon: Archive },
  ];

  // Fetch active orders with caching
  const { data: orders, isLoading, refetch: refetchOrders } = useDataFetching(
    ['activeOrders'],
    async () => {
      const data = await jobOrderAPI.getAllOrders();
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  // Fetch archived orders with caching
  const { data: archivedOrders, isLoading: isArchiveLoading, refetch: refetchArchivedOrders } = useDataFetching(
    ['archivedOrders'],
    async () => {
      const data = await jobOrderAPI.getArchivedOrders();
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  // Reject mutation
  const rejectMutation = useDataMutation(
    ['activeOrders', 'archivedOrders'],
    async ({ orderId, reason }) => {
      const result = await jobOrderAPI.rejectOrder(orderId, reason);
      await Promise.all([refetchOrders(), refetchArchivedOrders()]);
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Order rejected successfully");
        setRejectDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to reject order");
      },
    }
  );

  // Archive/Restore mutation
  const archiveMutation = useDataMutation(
    ['activeOrders', 'archivedOrders'],
    async (orderId) => {
      const result = await jobOrderAPI.toggleArchive(orderId);
      await Promise.all([refetchOrders(), refetchArchivedOrders()]);
      return result;
    },
    {
      onSuccess: (response) => {
        toast.success(response.message);
        setArchiveDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to archive order");
      },
    }
  );

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
    // Refetch orders to get the latest data
    refetchOrders();
  };

  const handleReject = async (reason) => {
    if (selectedOrder) {
      await rejectMutation.mutateAsync({ orderId: selectedOrder._id, reason });
    }
  };

  const handleArchiveConfirm = async () => {
    if (selectedOrder) {
      await archiveMutation.mutateAsync(selectedOrder._id);
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
              data={orders || []}
              columns={columns}
              isLoading={isLoading}
              actionCategories={activeOrderActions}
              emptyMessage="No active orders found."
            />
          </TabPanel>
          
          <TabPanel value="archived">
            <DataTable
              className="mt-4"
              data={archivedOrders || []}
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
          isLoading={rejectMutation.isPending}
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
          isLoading={archiveMutation.isPending}
          variant={selectedOrder?.isArchived ? "success" : "default"}
          icon={selectedOrder?.isArchived ? ArchiveRestore : Archive}
        />
      </div>
    </PrivateLayout>
  );
}
