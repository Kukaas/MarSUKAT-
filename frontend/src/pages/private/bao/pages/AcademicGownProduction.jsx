import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Eye,
  GraduationCap,
  Calendar,
  Table2,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { productionAPI } from "../../joborder/api/productionApi";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { AcademicGownProductionOverviewChart } from "../../joborder/components/charts/AcademicGownProductionOverviewChart";
import { AcademicGownTypeProductionChart } from "../../joborder/components/charts/AcademicGownTypeProductionChart";
import { AcademicGownLevelProductionChart } from "../../joborder/components/charts/AcademicGownLevelProductionChart";
import CustomSelect from "@/components/custom-components/CustomSelect";
import StatsCard from "@/components/custom-components/StatsCard";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { AcademicGownProductionDetailsDialog } from "../../joborder/components/details/academic-gown-production-details";
import { formatDate } from "@/lib/utils";

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

export default function AcademicGownProduction() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [productions, setProductions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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
      toast.error("Failed to fetch production data");
      console.error("Error fetching data:", error);
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
          title="Academic Gown Production Overview"
          description="View academic gown production data and analytics"
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
                data={productions}
                columns={columns}
                isLoading={isLoading}
                actionCategories={actionCategories}
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

        {/* View Dialog */}
        <AcademicGownProductionDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={selectedItem}
        />
      </div>
    </PrivateLayout>
  );
}
