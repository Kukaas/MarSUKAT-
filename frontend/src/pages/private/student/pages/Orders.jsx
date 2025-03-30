import { useState, useEffect } from "react";
import PrivateLayout from "../../PrivateLayout";
import { orderAPI } from "../api/orderApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  Receipt,
  Clock,
  CheckCircle2,
  Ruler,
  PackageCheck,
  ShoppingBag,
  Calendar,
  Edit,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import OrderForm from "../forms/OrderForm";
import { OrderDetailsDialog } from "../components/OrderDetails";
import StatusBadge from "@/components/custom-components/StatusBadge";
import { DataTable } from "@/components/custom-components/DataTable";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationDialog } from "@/components/custom-components/ConfirmationDialog";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";
import SectionHeader from "@/components/custom-components/SectionHeader";

// Add this status icon mapping
const STATUS_ICONS = {
  Pending: Clock,
  Approved: CheckCircle2,
  Measured: Ruler,
  "For Pickup": PackageCheck,
  Claimed: ShoppingBag,
  "Payment Verified": CheckCircle2,
  "For Verification": Clock,
  Cancelled: XCircle,
};

export default function Orders() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Replace fetchOrders with useDataFetching
  const { data: orders = [], isLoading, refetch: refetchOrders } = useDataFetching(
    ['studentOrders', user?._id],
    async () => {
      const data = await orderAPI.getOrdersByUserId(user?._id);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      enabled: !!user?._id,
    }
  );

  // Check URL for openCreateModal parameter to open "New Order" modal automatically
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openCreateModal = urlParams.get('openCreateModal') === 'true';
    if (openCreateModal) {
      setIsCreateDialogOpen(true);
    }
  }, []);

  // Create mutation
  const createMutation = useDataMutation(
    ['studentOrders'],
    async (data) => {
      const result = await orderAPI.createStudentOrder(data);
      await refetchOrders();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Order created successfully");
        setIsCreateDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create order");
      },
    }
  );

  // Cancel mutation
  const cancelMutation = useDataMutation(
    ['studentOrders'],
    async (id) => {
      const result = await orderAPI.deleteStudentOrder(id);
      await refetchOrders();
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
        setIsCancelDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to cancel order");
      },
    }
  );

  // Update handlers to use mutations
  const handleCreateOrder = async (data) => {
    if (!user?._id) {
      toast.error("User authentication error");
      return;
    }

    const orderData = {
      ...data,
      userId: user._id,
    };

    await createMutation.mutateAsync(orderData);
  };

  const handleCancelOrder = async () => {
    await cancelMutation.mutateAsync(orderToCancel._id);
  };

  const handleOrderUpdate = () => {
    refetchOrders();
  };

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
      key: "status",
      header: "Status",
      render: (value) => (
        <StatusBadge status={value} icon={STATUS_ICONS[value]} />
      ),
    },
    {
      key: "receipts",
      header: "Payment",
      render: (receipts) => {
        const latestReceipt =
          receipts && receipts.length > 0
            ? receipts[receipts.length - 1]
            : null;
        return (
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-gray-500" />
            <span>
              {latestReceipt
                ? `${latestReceipt.type} - ₱${latestReceipt.amount.toFixed(2)}`
                : "No payment"}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Order Date",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
  ];

  // Define actions for both views
  const actionCategories = {
    view: {
      label: "View Actions",
      actions: [
        {
          label: "View Details",
          icon: Eye,
          onClick: (row) => {
            setSelectedOrder(row);
            setIsViewDialogOpen(true);
          },
        },
        {
          label: "Cancel Order",
          icon: XCircle,
          onClick: (row) => {
            setOrderToCancel(row);
            setIsCancelDialogOpen(true);
          },
          show: (row) => row.status === "Pending",
          className: "text-destructive",
        },
      ],
    },
  };

  // Grid view component
  const OrderGrid = ({ orders }) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => {
        const latestReceipt =
          order.receipts && order.receipts.length > 0
            ? order.receipts[order.receipts.length - 1]
            : null;

        return (
          <Card
            key={order._id}
            className="hover:bg-accent/50 transition-colors"
          >
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{order.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.orderId}
                  </p>
                </div>
                <StatusBadge
                  status={order.status}
                  icon={STATUS_ICONS[order.status]}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {latestReceipt
                      ? `${
                          latestReceipt.type
                        } - ₱${latestReceipt.amount.toFixed(2)}`
                      : "No payment"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ordered on {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                {order.status === "Pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      setOrderToCancel(order);
                      setIsCancelDialogOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsViewDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <PrivateLayout>
      <div className="space-y-6 p-4">
        <SectionHeader
          title="My Orders"
          description="View and manage your orders"
        />
        <DataTable
          data={orders}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New Order</span>
            </div>
          }
          emptyMessage="No orders found. Create your first order!"
        />

        {/* Create Order Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px] h-[82vh] sm:h-[90vh] flex flex-col gap-0">
            <AlertDialogHeader className="flex-none">
              <AlertDialogTitle>Create New Order</AlertDialogTitle>
              <AlertDialogDescription>
                Please fill in your order details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="px-1 py-4">
                  <OrderForm
                    onSubmit={handleCreateOrder}
                    isSubmitting={createMutation.isPending}
                    formData={{ userId: user?._id }}
                  />
                </div>
              </ScrollArea>
            </div>
            <AlertDialogFooter className="flex-none border-t pt-4">
              <AlertDialogCancel
                onClick={() => !createMutation.isPending && setIsCreateDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="orderForm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create Order"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Order Dialog */}
        <OrderDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          order={selectedOrder}
          onOrderUpdate={handleOrderUpdate}
        />

        {/* Cancel Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onConfirm={handleCancelOrder}
          title="Cancel Order"
          description="Are you sure you want to cancel this order? This action cannot be undone."
          confirmText="Cancel Order"
          cancelText="Keep Order"
          isLoading={cancelMutation.isPending}
          variant="destructive"
        />
      </div>
    </PrivateLayout>
  );
}
