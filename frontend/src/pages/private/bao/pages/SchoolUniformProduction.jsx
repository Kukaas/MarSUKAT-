import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Eye,
  Shirt,
  GraduationCap,
  Calendar,
  Table2,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { productionAPI } from "../../joborder/api/productionApi";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { ProductionOverviewChart } from "../../joborder/components/charts/ProductionOverviewChart";
import { ProductTypeProductionChart } from "../../joborder/components/charts/ProductTypeProductionChart";
import { LevelProductionChart } from "../../joborder/components/charts/LevelProductionChart";
import CustomSelect from "@/components/custom-components/CustomSelect";
import StatsCard from "@/components/custom-components/StatsCard";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { SchoolUniformProductionDetailsDialog } from "../../joborder/components/details/school-uniform-production-details";
import { formatDate } from "@/lib/utils";
import { useDataFetching } from "@/hooks/useDataFetching";

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

export default function SchoolUniformProduction() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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

  // Use React Query for data fetching with caching
  const { data: productionsData, isLoading: isLoadingProductions } = useDataFetching(
    ['productions'],
    () => productionAPI.getAllSchoolUniformProductions(),
    {
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      onError: (error) => {
        toast.error("Failed to fetch production data");
        console.error("Error fetching data:", error);
      },
    }
  );

  const { data: statsData, isLoading: isLoadingStats } = useDataFetching(
    ['production-stats', selectedYear, selectedMonth],
    () => productionAPI.getProductionStats(selectedYear, selectedMonth),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      onError: (error) => {
        toast.error("Failed to fetch production statistics");
        console.error("Error fetching stats:", error);
      },
    }
  );

  const isLoading = isLoadingProductions || isLoadingStats;

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
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="School Uniform Production Overview"
          description="View school uniform production data and analytics"
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
              icon={<Shirt className="h-4 w-4 text-muted-foreground" />}
              description="Units produced"
            />
            <StatsCard 
              title="Average Production"
              value={statsData?.totalProduction || 0}
              icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
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
                data={productionsData || []}
                columns={columns}
                isLoading={isLoading}
                actionCategories={actionCategories}
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
        </div>

        {/* View Dialog */}
        <SchoolUniformProductionDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />
      </div>
    </PrivateLayout>
  );
}
