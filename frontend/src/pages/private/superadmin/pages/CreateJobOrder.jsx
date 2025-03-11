import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { FileText, User, Building2, Calendar, Plus } from "lucide-react";
import {
  JOB_ORDER_STATUSES,
  PRIORITY_STATUSES,
  getJobOrderStatusConfig,
  getPriorityStatusConfig,
  getJobOrderStatusArray,
  getPriorityStatusArray,
} from "@/config/statuses";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function CreateJobOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [jobOrders, setJobOrders] = useState([]);

  // Simulate API call with loading state
  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setJobOrders(mockData);
        setIsLoading(false);
      }, 2000);
    };

    fetchData();
  }, []);

  // Mock data for job orders
  const mockData = [
    {
      id: "JO-2024-001",
      requestedBy: "John Doe",
      department: "IT Department",
      dateRequested: "2024-03-11",
      status: "Pending",
      priority: "High",
      description: "Computer repair and maintenance",
    },
    {
      id: "JO-2024-002",
      requestedBy: "Jane Smith",
      department: "HR Department",
      dateRequested: "2024-03-10",
      status: "Approved",
      priority: "Medium",
      description: "Printer installation",
    },
    {
      id: "JO-2024-003",
      requestedBy: "Mike Johnson",
      department: "Finance",
      dateRequested: "2024-03-09",
      status: "Completed",
      priority: "Low",
      description: "Network troubleshooting",
    },
    {
      id: "JO-2024-004",
      requestedBy: "Sarah Williams",
      department: "Marketing",
      dateRequested: "2024-03-08",
      status: "For Claiming",
      priority: "High",
      description: "Software installation",
    },
  ];

  // Column definitions with enhanced grid view rendering
  const columns = [
    {
      key: "id",
      header: "Job Order ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "requestedBy",
      header: "Requested By",
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
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
      key: "dateRequested",
      header: "Date Requested",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>
            {new Date(value).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => {
        const statusConfig = getJobOrderStatusConfig(value);
        const StatusIcon = statusConfig.icon;
        return (
          <Badge className={cn("px-2 py-1", statusConfig.color)}>
            <div className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig.label}</span>
            </div>
          </Badge>
        );
      },
    },
    {
      key: "priority",
      header: "Priority",
      render: (value) => {
        const priorityConfig = getPriorityStatusConfig(value);
        const PriorityIcon = priorityConfig.icon;
        return (
          <Badge className={cn("px-2 py-1", priorityConfig.color)}>
            <div className="flex items-center gap-1">
              <PriorityIcon className="h-3 w-3" />
              <span>{priorityConfig.label}</span>
            </div>
          </Badge>
        );
      },
    },
    {
      key: "description",
      header: "Description",
      render: (value) => (
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-gray-500 mt-1" />
          <span className="line-clamp-3">{value}</span>
        </div>
      ),
    },
  ];

  // Get status options for filtering from the config
  const statusOptions = getJobOrderStatusArray().map((status) => status.value);

  // Handle create new job order
  const handleCreateNew = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      navigate("/create-job-order/new");
      setIsLoading(false);
    }, 500);
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Job Orders</h1>
        </div>

        <DataTable
          data={jobOrders}
          columns={columns}
          statusOptions={statusOptions}
          isLoading={isLoading}
          onCreateNew={handleCreateNew}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Job Order</span>
            </div>
          }
        />
      </div>
    </PrivateLayout>
  );
}
