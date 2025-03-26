import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
  Calendar,
  AlertCircle,
  Package,
  TrendingUp,
  Table2,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { productionAPI } from "../api/productionApi";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import { formatDate } from "@/lib/utils";
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
import { AcademicGownProductionForm } from "../forms/AcademicGownProductionForm";
import { AcademicGownProductionDetailsDialog } from "../components/details/academic-gown-production-details";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AcademicGownProductionOverviewChart } from "../components/charts/AcademicGownProductionOverviewChart";
import { AcademicGownTypeProductionChart } from "../components/charts/AcademicGownTypeProductionChart";
import { AcademicGownLevelProductionChart } from "../components/charts/AcademicGownLevelProductionChart";
import CustomSelect from "@/components/custom-components/CustomSelect";
import StatsCard from "@/components/custom-components/StatsCard";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { useNavigate, useLocation } from "react-router-dom";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const AcademicGownProduction = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    level: "",
    productType: "",
    size: "",
    quantity: "",
    productionDateFrom: "",
    productionDateTo: "",
    rawMaterialsUsed: [],
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [inventoryIssues, setInventoryIssues] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [activeTab, setActiveTab] = useState("table");

  // Define tab configuration
  const tabConfig = [
    { value: "table", label: "Production Table", icon: Table2 },
    { value: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: MONTHS[i]
  }));

  const handleAuthError = async (error) => {
    if (error.message === "Session expired. Please log in again.") {
      toast.error("Your session has expired. Please log in again.");
      await logout();
      navigate("/login", { state: { from: location.pathname } });
    } else {
      toast.error(error.message || "An error occurred");
    }
  };

  // Fetch productions data with caching
  const { data: productionsData, isLoading, refetch } = useDataFetching(
    ['academicGownProductions', selectedYear, selectedMonth],
    async () => {
      const [productions, stats] = await Promise.all([
        productionAPI.getAllAcademicGownProductions(),
        productionAPI.getAcademicGownProductionStats(selectedYear, selectedMonth)
      ]);
      return { productions, stats };
    },
    {
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      onError: handleAuthError,
    }
  );

  const productions = productionsData?.productions || [];
  const statsData = productionsData?.stats;

  // Create mutation
  const createMutation = useDataMutation(
    ['academicGownProductions'],
    async (data) => {
      const result = await productionAPI.createAcademicGownProduction(data);
      if (result.inventoryIssues) {
        setInventoryIssues(result.inventoryIssues);
        return result;
      }
      await refetch(); // Refetch data after successful creation
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Production created successfully");
        setIsCreateDialogOpen(false);
        setInventoryIssues(null);
        handleDialogClose("create");
      },
      onError: (error) => {
        if (error.response?.data?.inventoryIssues) {
          setInventoryIssues(error.response.data.inventoryIssues);
        } else {
          handleAuthError(error);
        }
      },
    }
  );

  // Update mutation
  const updateMutation = useDataMutation(
    ['academicGownProductions'],
    async (data) => {
      const result = await productionAPI.updateAcademicGownProduction(selectedId, data);
      await refetch(); // Refetch data after successful update
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Production updated successfully");
        setIsEditDialogOpen(false);
        handleDialogClose("edit");
      },
      onError: handleAuthError,
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['academicGownProductions'],
    async (id) => {
      const result = await productionAPI.deleteAcademicGownProduction(id);
      await refetch(); // Refetch data after successful deletion
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Production deleted successfully");
        setDeleteDialog({ isOpen: false, itemToDelete: null });
      },
      onError: handleAuthError,
    }
  );

  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.itemToDelete) {
      await deleteMutation.mutateAsync(deleteDialog.itemToDelete._id);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteMutation.isPending) {
      setDeleteDialog({ isOpen: false, itemToDelete: null });
    }
  };

  const handleDialogClose = (type) => {
    if (type === "edit") {
      setIsEditDialogOpen(false);
      setIsEditing(false);
      setSelectedId(null);
    } else if (type === "create") {
      setIsCreateDialogOpen(false);
      setInventoryIssues(null);
    }
    setFormData({
      level: "",
      productType: "",
      size: "",
      quantity: "",
      productionDateFrom: "",
      productionDateTo: "",
      rawMaterialsUsed: [],
    });
  };

  const columns = [
    {
      key: "productionId",
      header: "Production ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "productType",
      header: "Product Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "productionDateFrom",
      header: "Start Date",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: "productionDateTo",
      header: "End Date",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{formatDate(value)}</span>
        </div>
      ),
    },
  ];

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
    delete: {
      label: "Delete Actions",
      actions: [
        {
          label: "Delete",
          icon: Trash2,
          onClick: (row) => {
            setDeleteDialog({
              isOpen: true,
              itemToDelete: row,
            });
          },
          variant: "destructive",
        },
      ],
    },
  };

  const InventoryIssuesDisplay = ({ issues }) => {
    if (!issues) return null;

    return (
      <Card className="mt-4 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Raw Material Inventory Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {issues.missingMaterials.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Missing Materials:</h4>
              <ul className="list-inside list-disc space-y-1">
                {issues.missingMaterials.map((material, index) => (
                  <li key={index} className="text-sm text-red-600">
                    {material.type} ({material.category}) - {material.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {issues.insufficientMaterials.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">
                Insufficient Quantities:
              </h4>
              <ul className="list-inside list-disc space-y-1">
                {issues.insufficientMaterials.map((material, index) => (
                  <li key={index} className="text-sm text-red-600">
                    {material.type} ({material.category}):
                    <ul className="ml-4 list-inside list-none">
                      <li>
                        Available: {material.available} {material.unit}
                      </li>
                      <li>
                        Needed: {material.needed} {material.unit}
                      </li>
                      <li>
                        Shortage: {material.shortageAmount} {material.unit}
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Academic Gown Production Management"
          description="Manage academic gown production in the system"
        />

        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/2">
              <CustomSelect
                name="year"
                label="Year"
                placeholder="Select year"
                options={years.map(year => ({ value: year, label: year }))}
                value={selectedYear}
                onChange={setSelectedYear}
              />
            </div>
            <div className="w-full md:w-1/2">
              <CustomSelect
                name="month"
                label="Month"
                placeholder="Select month"
                options={months}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard 
              title="Total Production"
              value={statsData?.totalProduction || 0}
              icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
              description="Units produced"
            />
            <StatsCard 
              title="Average Production"
              value={statsData?.totalProduction || 0}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              description="Total units this period"
            />
          </div>

          <CustomTabs 
            defaultValue="table" 
            onValueChange={setActiveTab}
            tabs={tabConfig}
          >
            <TabPanel value="table">
              <DataTable
                className="mt-4"
                data={productions}
                columns={columns}
                isLoading={isLoading}
                actionCategories={actionCategories}
                onCreateNew={() => {
                  setFormData({
                    level: "",
                    productType: "",
                    size: "",
                    quantity: "",
                    productionDateFrom: "",
                    productionDateTo: "",
                    rawMaterialsUsed: [],
                  });
                  setIsEditing(false);
                  setSelectedId(null);
                  setIsCreateDialogOpen(true);
                }}
                createButtonText={
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Production</span>
                  </div>
                }
              />
            </TabPanel>

            <TabPanel value="analytics">
              <div className="grid grid-cols-1 gap-8 mt-4">
                <AcademicGownProductionOverviewChart data={statsData} loading={isLoading} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AcademicGownTypeProductionChart data={statsData} loading={isLoading} />
                  <AcademicGownLevelProductionChart data={statsData} loading={isLoading} />
                </div>
              </div>
            </TabPanel>
          </CustomTabs>
        </div>

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Production
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new production record
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AcademicGownProductionForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={createMutation.isPending}
                  inventoryIssues={inventoryIssues}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setInventoryIssues(null);
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="academicGownProductionForm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <AlertDialog open={isEditDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Edit Production
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the production details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AcademicGownProductionForm
                  formData={formData}
                  setFormData={setFormData}
                  isEdit={true}
                  onSubmit={handleSubmit}
                  isSubmitting={updateMutation.isPending}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                onClick={() => !updateMutation.isPending && setIsEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="academicGownProductionForm"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Production"
          description="Are you sure you want to delete this production record? This action cannot be undone."
          isDeleting={deleteMutation.isPending}
        />

        {/* View Dialog */}
        <AcademicGownProductionDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />
      </div>
    </PrivateLayout>
  );
};
