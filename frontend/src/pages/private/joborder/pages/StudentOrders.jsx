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
} from "lucide-react";
import { toast } from "sonner";
import { OrderDetailsDialog } from "../components/order-details";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { DataTable } from "@/components/custom-components/DataTable";
import { formatDate } from "@/lib/utils";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { RejectDialog } from "@/components/custom-components/RejectDialog";

// Status icon mapping
const STATUS_ICONS = {
  Pending: Clock,
  Approved: CheckCircle2,
  Measured: Ruler,
  "For Pickup": PackageCheck,
  Claimed: ShoppingBag,
};

export function StudentOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

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

  useEffect(() => {
    fetchOrders();
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

  // Define actions for the table
  const actionCategories = {
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
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Student Orders Management"
          description="View and manage student uniform orders"
        />

        <DataTable
          data={orders}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          emptyMessage="No orders found."
        />

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
      </div>
    </PrivateLayout>
  );
}
