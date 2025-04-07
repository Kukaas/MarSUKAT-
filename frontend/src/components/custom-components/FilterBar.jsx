import { useState } from "react";
import { 
  Filter, 
  Printer, 
  CalendarDays, 
  CalendarRange 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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

/**
 * Reusable FilterBar component with date filtering capabilities
 * @param {Object} props
 * @param {string} props.selectedYear - Currently selected year
 * @param {string} props.selectedMonth - Currently selected month (1-12 as string)
 * @param {Function} props.onYearChange - Function to handle year change
 * @param {Function} props.onMonthChange - Function to handle month change
 * @param {string} props.viewingLabel - Custom label for the viewing section (default: "Viewing:")
 * @param {Function} props.onPrintClick - Optional function to handle print button click
 * @param {string} props.printTooltip - Tooltip text for print button (default: "Print Report")
 * @param {boolean} props.showPrintButton - Whether to show the print button (default: true)
 * @param {React.ReactNode} props.additionalFilters - Optional additional filter components to render
 * @param {React.ReactNode} props.additionalActions - Optional additional action buttons
 * @param {Function} props.isCustomFilterActive - Custom function to determine if non-default filters are active
 * @param {React.ReactNode} props.customViewingContent - Custom content to display in the viewing section
 * @param {string} props.filterTitle - Title for the filter popover (default: "Date Filters")
 * @param {string} props.resetButtonText - Text for the reset button (default: "Reset")
 * @param {Function} props.onResetFilters - Custom function to reset all filters
 * @param {React.ReactNode} props.periodTypeSelector - Optional component to select period type (monthly/yearly)
 */
const FilterBar = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  viewingLabel = "Viewing:",
  onPrintClick,
  printTooltip = "Print Report",
  showPrintButton = true,
  additionalFilters,
  additionalActions,
  isCustomFilterActive,
  customViewingContent,
  filterTitle = "Date Filters",
  resetButtonText = "Reset",
  onResetFilters,
  periodTypeSelector,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();
  
  // Generate years array (current year and 4 previous years)
  const years = Array.from(
    { length: 5 },
    (_, i) => (Number(currentYear) - i).toString()
  );

  // Check if custom filters are applied
  const hasCustomFilters = isCustomFilterActive 
    ? isCustomFilterActive() 
    : (selectedYear !== currentYear || selectedMonth !== currentMonth);

  // Reset filters to current month/year
  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      onYearChange?.(currentYear);
      onMonthChange?.(currentMonth);
    }
  };

  // Handle print button click
  const handlePrintClick = () => {
    if (onPrintClick) {
      onPrintClick();
    } else {
      toast.info("Print functionality not implemented");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Viewing section */}
      {(viewingLabel || customViewingContent) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="text-sm text-muted-foreground flex items-center">
            {customViewingContent || (
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-medium">{viewingLabel}</span>
                <Badge variant="secondary" className="font-normal">
                  {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* Filter Dropdown */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1 px-3 text-sm font-normal"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
              {hasCustomFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">
                  •
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{filterTitle}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleReset}
                >
                  {resetButtonText}
                </Button>
              </div>
              
              {/* Period Type Selector if provided */}
              {periodTypeSelector}
              
              {/* Only show month/year selectors if functions are provided */}
              {onMonthChange && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Month</label>
                  <Select 
                    value={selectedMonth} 
                    onValueChange={onMonthChange}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                        <SelectValue placeholder="Select month" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[220px] overflow-y-auto">
                      {MONTHS.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {onYearChange && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Year</label>
                  <Select 
                    value={selectedYear} 
                    onValueChange={onYearChange}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <div className="flex items-center gap-2">
                        <CalendarRange className="h-3 w-3 text-muted-foreground" />
                        <SelectValue placeholder="Select year" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[180px] overflow-y-auto">
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Render additional filter components if provided */}
              {additionalFilters}
              
              <div className="pt-2">
                <Button 
                  type="button" 
                  size="sm"
                  className="w-full h-8"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Print button - only shown if showPrintButton is true */}
        {showPrintButton && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 px-3 text-sm font-normal"
                  onClick={handlePrintClick}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{printTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Render additional action buttons if provided */}
        {additionalActions}
      </div>
    </div>
  );
};

export default FilterBar; 