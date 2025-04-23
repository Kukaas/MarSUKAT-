import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  Eye,
  GraduationCap,
  Calendar,
  Table2,
  BarChart3,
  TrendingUp,
  Download,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { productionAPI } from "../../joborder/api/productionApi";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { AcademicGownProductionOverviewChart } from "../../joborder/components/charts/AcademicGownProductionOverviewChart";
import { AcademicGownTypeProductionChart } from "../../joborder/components/charts/AcademicGownTypeProductionChart";
import { AcademicGownLevelProductionChart } from "../../joborder/components/charts/AcademicGownLevelProductionChart";
import StatsCard from "@/components/custom-components/StatsCard";
import { CustomTabs, TabPanel } from "@/components/custom-components/CustomTabs";
import { AcademicGownProductionDetailsDialog } from "../../joborder/components/details/academic-gown-production-details";
import { formatDate } from "@/lib/utils";
import { useDataFetching } from "@/hooks/useDataFetching";
import FilterBar from "@/components/custom-components/FilterBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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

  // Use React Query for data fetching with caching
  const { data: productionData, isLoading } = useDataFetching(
    ['academicGownProduction', selectedYear, selectedMonth, timePeriod],
    async () => {
      let productionsPromise = productionAPI.getAllAcademicGownProductions(selectedYear);
      let statsPromise;
      
      if (timePeriod === "month") {
        statsPromise = productionAPI.getAcademicGownProductionStats(selectedYear, selectedMonth);
      } else {
        statsPromise = productionAPI.getAcademicGownYearlyStats(selectedYear);
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
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to fetch production data"
        );
      },
    }
  );

  const productions = productionData?.productions || [];
  const statsData = productionData?.stats || null;

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
            icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
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
