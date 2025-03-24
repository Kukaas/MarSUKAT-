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
import { useEffect, useState, useCallback } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [productions, setProductions] = useState([]);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [inventoryIssues, setInventoryIssues] = useState(null);
  const [statsData, setStatsData] = useState(null);
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

  const handleAuthError = useCallback(async (error) => {
    if (error.message === "Session expired. Please log in again.") {
      toast.error("Your session has expired. Please log in again.");
      await logout();
      navigate("/login", { state: { from: location.pathname } });
    } else {
      toast.error(error.message || "An error occurred");
    }
  }, [logout, navigate]);

  const fetchProductions = async () => {
    try {
      setIsLoading(true);
      const [productionsData, stats] = await Promise.all([
        productionAPI.getAllAcademicGownProductions(),
        productionAPI.getAcademicGownProductionStats(selectedYear, selectedMonth)
      ]);
      setProductions(productionsData);
      setStatsData(stats);
    } catch (error) {
      await handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, [selectedYear, selectedMonth]);

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

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setInventoryIssues(null);

      if (isEditing) {
        console.log("Updating production...");
        await productionAPI.updateAcademicGownProduction(selectedId, data);
        toast.success("Production updated successfully");
        setIsEditDialogOpen(false);
      } else {
        console.log("Creating new production...");
        const response = await productionAPI.createAcademicGownProduction(data);

        if (response.inventoryIssues) {
          setInventoryIssues(response.inventoryIssues);
          return;
        }

        toast.success("Production created successfully");
        setIsCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({
        level: "",
        productType: "",
        size: "",
        quantity: "",
        productionDateFrom: "",
        productionDateTo: "",
        rawMaterialsUsed: [],
      });
      setSelectedId(null);
      fetchProductions();
    } catch (error) {
      await handleAuthError(error);
      if (error.response?.data?.inventoryIssues) {
        setInventoryIssues(error.response.data.inventoryIssues);
      }
    } finally {
      setIsSubmitting(false);
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
                  isSubmitting={isSubmitting}
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
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="academicGownProductionForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
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
                  isSubmitting={isSubmitting}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                onClick={() => !isSubmitting && setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="academicGownProductionForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, itemToDelete: null })}
          onConfirm={async () => {
            try {
              setIsDeleting(true);
              await productionAPI.deleteAcademicGownProduction(
                deleteDialog.itemToDelete._id
              );
              toast.success("Production deleted successfully");
              fetchProductions();
            } catch (error) {
              toast.error("Failed to delete production");
            } finally {
              setIsDeleting(false);
              setDeleteDialog({ isOpen: false, itemToDelete: null });
            }
          }}
          title="Delete Production"
          description="Are you sure you want to delete this production record? This action cannot be undone."
          isDeleting={isDeleting}
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
