import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
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
import { devAPI } from "@/lib/api";

const OrdersTab = () => {
  const [studentEmail, setStudentEmail] = useState("");
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

  return (
    <div className="space-y-4 pb-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Create Test Order</CardTitle>
          <CardDescription>
            Create a test order for a student user
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