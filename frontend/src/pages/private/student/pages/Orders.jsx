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

// Add this status icon mapping
const STATUS_ICONS = {
  Pending: Clock,
  Approved: CheckCircle2,
  Measured: Ruler,
  "For Pickup": PackageCheck,
  Claimed: ShoppingBag,
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);

  // Fetch orders for current user
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderAPI.getMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch your orders");
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
      key: "status",
      header: "Status",
      render: (value) => (
        <StatusBadge status={value} icon={STATUS_ICONS[value]} />
      ),
    },
    {
      key: "receipt",
      header: "Payment",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-gray-500" />
          <span>
            {value.type} - ₱{value.amount.toFixed(2)}
          </span>
        </div>
      ),
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

  const handleCreateOrder = async (data) => {
    try {
      setIsSubmitting(true);

      if (!user?._id) {
        toast.error("User authentication error");
        return;
      }

      const orderData = {
        ...data,
        userId: user._id,
      };

      await orderAPI.createStudentOrder(orderData);
      toast.success("Order created successfully");
      setIsCreateDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOrder = async (data) => {
    try {
      setIsSubmitting(true);
      await orderAPI.updateStudentOrder(orderToEdit._id, data);
      toast.success("Order updated successfully");
      setIsEditDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Order update error:", error);
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          label: "Edit Order",
          icon: Edit,
          onClick: (row) => {
            setOrderToEdit(row);
            setIsEditDialogOpen(true);
          },
          show: (row) => row.status === "Pending",
        },
      ],
    },
  };

  // Grid view component
  const OrderGrid = ({ orders }) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => {
        const statusConfig = getStudentOrderStatusConfig(order.status);

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
                    {order.receipt.type} - ₱{order.receipt.amount.toFixed(2)}
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
                    onClick={() => {
                      setOrderToEdit(order);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <DataTable
            data={orders}
            columns={columns}
            isLoading={isLoading}
            actionCategories={actionCategories}
            gridView={<OrderGrid orders={orders} />}
            emptyMessage="No orders found. Create your first order!"
          />
        )}

        {/* Create Order Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Order</AlertDialogTitle>
              <AlertDialogDescription>
                Please fill in your order details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <OrderForm
                onSubmit={handleCreateOrder}
                isSubmitting={isSubmitting}
                formData={{ userId: user?._id }}
              />
            </ScrollArea>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => !isSubmitting && setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="orderForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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

        {/* Edit Order Dialog */}
        <AlertDialog open={isEditDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Order</AlertDialogTitle>
              <AlertDialogDescription>
                Update your order details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <OrderForm
                onSubmit={handleEditOrder}
                isSubmitting={isSubmitting}
                formData={orderToEdit}
                isEditing={true}
              />
            </ScrollArea>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => !isSubmitting && setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="orderForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update Order"
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
        />
      </div>
    </PrivateLayout>
  );
}
