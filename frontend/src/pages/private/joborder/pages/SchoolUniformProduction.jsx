import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Plus,
  Eye,
  Trash2,
  Shirt,
  GraduationCap,
  Calendar,
  AlertCircle,
  Package,
  TrendingUp,
  Table2,
  BarChart3,
  Download,
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
import { SchoolUniformProductionForm } from "../forms/SchoolUniformProductionForm";
import { SchoolUniformProductionDetailsDialog } from "../components/details/school-uniform-production-details";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProductionOverviewChart } from "../components/charts/ProductionOverviewChart";
import { ProductTypeProductionChart } from "../components/charts/ProductTypeProductionChart";
import { LevelProductionChart } from "../components/charts/LevelProductionChart";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { useDataFetching, useDataMutation } from "@/hooks/useDataFetching";
import StatsCard from "@/components/custom-components/StatsCard";
import FilterBar from "@/components/custom-components/FilterBar";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export const SchoolUniformProduction = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [inventoryIssues, setInventoryIssues] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [timePeriod, setTimePeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("table");

  // Custom viewing content with period label
  const customViewingContent = (
    <div className="flex flex-wrap items-center gap-1">
      <span className="font-medium">Viewing:</span>
      <Badge variant="secondary" className="font-normal">
        {timePeriod === "month"
          ? `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`
          : `Year ${selectedYear}`}
      </Badge>
    </div>
  );

  // Check if custom filters are applied
  const isCustomFilterActive = () => {
    return (
      selectedYear !== new Date().getFullYear().toString() || 
      selectedMonth !== (new Date().getMonth() + 1).toString() ||
      timePeriod !== "month"
    );
  };

  // Reset filters function
  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedMonth((new Date().getMonth() + 1).toString());
    setTimePeriod("month");
  };

  // Period type selector for the top of the filter
  const periodTypeSelector = (
    <div>
      <label className="text-xs font-medium mb-1 block">Time Period</label>
      <div className="flex gap-1 mb-2">
        <Button 
          size="sm"
          variant={timePeriod === "month" ? "default" : "outline"}
          className="flex-1 h-8 text-xs"
          onClick={() => setTimePeriod("month")}
        >
          Monthly
        </Button>
        <Button 
          size="sm"
          variant={timePeriod === "year" ? "default" : "outline"}
          className="flex-1 h-8 text-xs"
          onClick={() => setTimePeriod("year")}
        >
          Yearly
        </Button>
      </div>
    </div>
  );

  // Additional action button for export
  const additionalActions = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1 px-3 text-sm font-normal"
            onClick={() => {
              toast.info("Export functionality coming soon");
            }}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export as Excel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Define tab configuration
  const tabConfig = [
    { value: "table", label: "Production Table", icon: Table2 },
    { value: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleAuthError = async (error) => {
    if (error.message === "Session expired. Please log in again.") {
      toast.error("Your session has expired. Please log in again.");
      await logout();
      navigate("/login", { state: { from: location.pathname } });
    } else {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleDialogClose = (type) => {
    if (type === "create") {
      setIsCreateDialogOpen(false);
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

  // Fetch productions data with caching
  const { data: productionsData, isLoading, refetch: refetchProductions } = useDataFetching(
    ['schoolUniformProductions', selectedYear, selectedMonth, timePeriod],
    async () => {
      let productionsPromise = productionAPI.getAllSchoolUniformProductions(selectedYear);
      let statsPromise;
      
      if (timePeriod === "month") {
        statsPromise = productionAPI.getProductionStats(selectedYear, selectedMonth);
      } else {
        statsPromise = productionAPI.getSchoolUniformYearlyStats(selectedYear);
      }
      
      const [productions, stats] = await Promise.all([productionsPromise, statsPromise]);
      
      // Filter productions based on selected time period
      let filteredProductions = productions;
      if (timePeriod === "month") {
        // Filter by selected month and sort by date (newest first)
        filteredProductions = productions
          .filter(production => {
            const productionDate = new Date(production.productionDateFrom);
            return (
              productionDate.getFullYear() === parseInt(selectedYear) &&
              productionDate.getMonth() + 1 === parseInt(selectedMonth)
            );
          })
          .sort((a, b) => new Date(b.productionDateFrom) - new Date(a.productionDateFrom));
      } else {
        // Filter by selected year only and sort by date (newest first)
        filteredProductions = productions
          .filter(production => {
            const productionDate = new Date(production.productionDateFrom);
            return productionDate.getFullYear() === parseInt(selectedYear);
          })
          .sort((a, b) => new Date(b.productionDateFrom) - new Date(a.productionDateFrom));
      }
      
      return { productions: filteredProductions, stats };
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      onError: handleAuthError,
    }
  );

  const productions = productionsData?.productions || [];
  const statsData = productionsData?.stats;

  // Create mutation
  const createMutation = useDataMutation(
    ['schoolUniformProductions'],
    async (data) => {
      const response = await productionAPI.createSchoolUniformProduction(data);
      if (response.data?.inventoryIssues) {
        setInventoryIssues(response.data.inventoryIssues);
        return null;
      }
      await refetchProductions();
      return response;
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
          return;
        }
        handleAuthError(error);
      },
    }
  );

  // Delete mutation
  const deleteMutation = useDataMutation(
    ['schoolUniformProductions'],
    async (id) => {
      const result = await productionAPI.deleteSchoolUniformProduction(id);
      await refetchProductions();
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

  const columns = [
    {
      key: "productionId",
      header: "Production ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 text-gray-500" />
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
          <Shirt className="h-4 w-4 text-gray-500" />
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

  const handleSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      setFormData({
        level: "",
        productType: "",
        size: "",
        quantity: "",
        productionDateFrom: "",
        productionDateTo: "",
        rawMaterialsUsed: [],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewDialogOpen(true);
  };

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
          title="School Uniform Production Management"
          description="Manage school uniform production in the system"
        />

        <FilterBar
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={timePeriod === "month" ? setSelectedMonth : undefined}
          customViewingContent={customViewingContent}
          isCustomFilterActive={isCustomFilterActive}
          onResetFilters={handleResetFilters}
          showPrintButton={false}
          additionalActions={additionalActions}
          filterTitle="Production Filters"
          resetButtonText="Reset All"
          periodTypeSelector={periodTypeSelector}
        />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard 
              title="Total Production"
              value={statsData?.totalProduction || 0}
              icon={<Shirt className="h-4 w-4 text-muted-foreground" />}
            description={`Units produced this ${timePeriod}`}
            />
            <StatsCard 
              title="Average Production"
            value={statsData?.averageProduction || 0}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            description={`${timePeriod === "month" ? "Monthly" : "Yearly"} average`}
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
                <ProductionOverviewChart data={statsData} loading={isLoading} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ProductTypeProductionChart data={statsData} loading={isLoading} />
                  <LevelProductionChart data={statsData} loading={isLoading} />
                </div>
              </div>
            </TabPanel>
          </CustomTabs>

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
                <SchoolUniformProductionForm
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
                form="schoolUniformProductionForm"
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

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, itemToDelete: null })}
          onConfirm={async () => {
            if (deleteDialog.itemToDelete) {
              await deleteMutation.mutateAsync(deleteDialog.itemToDelete._id);
            }
          }}
          title="Delete Production"
          description="Are you sure you want to delete this production record? This action cannot be undone."
          isDeleting={deleteMutation.isPending}
        />

        {/* View Dialog */}
        <SchoolUniformProductionDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />
      </div>
    </PrivateLayout>
  );
};
