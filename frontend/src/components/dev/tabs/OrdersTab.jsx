import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { devAPI } from "@/lib/api";

const OrdersTab = () => {
  const [studentEmail, setStudentEmail] = useState("");
  const [orderCount, setOrderCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);

  const handleCreateOrder = async () => {
    if (!studentEmail) {
      toast.error("Please enter a student email");
      return;
    }

    setLoading(true);
    try {
      const result = await devAPI.createTestOrder(studentEmail);
      setLastCreatedOrder(result.order);
      toast.success("Test order created successfully", {
        description: `Order created for ${result.order.name}`,
      });
    } catch (error) {
      toast.error("Failed to create test order", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMassOrders = async () => {
    if (!studentEmail) {
      toast.error("Please enter a student email");
      return;
    }

    setLoading(true);
    try {
      const result = await devAPI.createMassOrders(orderCount, studentEmail);
      setLastCreatedOrder(result.orders[0]);
      toast.success("Mass orders created successfully", {
        description: `Created ${result.orders.length} orders for ${result.orders[0].name}`,
      });
    } catch (error) {
      toast.error("Failed to create mass orders", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllOrders = async () => {
    setLoading(true);
    try {
      await devAPI.deleteAllOrders();
      setLastCreatedOrder(null);
      toast.success("All orders deleted successfully");
    } catch (error) {
      toast.error("Failed to delete orders", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAllOrders = async () => {
    setLoading(true);
    try {
      const result = await devAPI.approveAllOrders();
      toast.success("Orders approved successfully", {
        description: `${result.approvedCount} orders approved, ${result.failedCount} failed`,
      });
    } catch (error) {
      toast.error("Failed to approve orders", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Student Email</CardTitle>
          <CardDescription>
            Enter the student email to use for creating orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-email">Student Email</Label>
            <Input
              id="student-email"
              type="email"
              placeholder="Enter student email..."
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Create Single Order</CardTitle>
          <CardDescription>
            Create a single test order for the student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCreateOrder}
            disabled={loading || !studentEmail}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              "Create Test Order"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Mass Create Orders</CardTitle>
          <CardDescription>
            Create multiple test orders for the same student
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order-count">Number of Orders</Label>
            <Input
              id="order-count"
              type="number"
              min="1"
              max="50"
              value={orderCount}
              onChange={(e) => setOrderCount(parseInt(e.target.value))}
            />
          </div>

          <Button
            onClick={handleCreateMassOrders}
            disabled={loading || !studentEmail}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Orders...
              </>
            ) : (
              "Create Mass Orders"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Approve All Orders</CardTitle>
          <CardDescription>
            Approve and schedule all pending orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleApproveAllOrders}
            disabled={loading}
            className="w-full"
            variant="secondary"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving Orders...
              </>
            ) : (
              "Approve All Orders"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Delete All Orders</CardTitle>
          <CardDescription>
            Delete all orders in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Delete All Orders
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  orders from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllOrders}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {lastCreatedOrder && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Last Created Order</CardTitle>
            <CardDescription>Details of the last test order</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(lastCreatedOrder, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrdersTab; 