import * as React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronsUpDown,
  X,
  Plus,
  Loader2,
  LayoutList,
  LayoutGrid,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GridView } from "./GridView";

const LoadingSpinner = () => (
  <TableRow>
    <TableCell colSpan="100%" className="h-[200px] relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-primary/10 animate-pulse"></div>
          <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-base font-medium text-muted-foreground">
            Loading Data
          </p>
          <p className="text-sm text-muted-foreground/60">
            Please wait while we fetch your information
          </p>
        </div>
      </div>
    </TableCell>
  </TableRow>
);

const DataTable = ({
  data = [],
  columns = [],
  onCreateNew,
  statusOptions = [],
  createButtonText = "Create New",
  className,
  isLoading = false,
  actions = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState(data);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [viewMode, setViewMode] = useState("table");

  // Set default view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // md breakpoint
        setViewMode("grid");
      } else {
        setViewMode("table");
      }
    };

    // Set initial view mode
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter data based on search query, status, and date range
  useEffect(() => {
    let result = [...data];

    if (searchQuery) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (dateRange.from && dateRange.to) {
      result = result.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [data, searchQuery, statusFilter, dateRange]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange({ from: undefined, to: undefined });
  };

  // Add actions column if actions are provided
  const columnsWithActions = React.useMemo(() => {
    if (!actions.length) return columns;

    return [
      ...columns,
      {
        key: "actions",
        header: "Actions",
        render: (_, row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, index) => {
                // If the action should be hidden based on row data
                if (action.show && !action.show(row)) {
                  return null;
                }

                // If this is not the first visible action and the previous action was visible, show separator
                const shouldShowSeparator =
                  index > 0 &&
                  (!actions[index - 1].show || actions[index - 1].show(row));

                return (
                  <React.Fragment key={action.label}>
                    {shouldShowSeparator && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => action.onClick(row)}
                      className={cn(
                        action.variant === "destructive" && "text-destructive",
                        "cursor-pointer"
                      )}
                    >
                      {action.icon && (
                        <span className="mr-2 h-4 w-4">
                          {React.createElement(action.icon, {
                            className: "h-4 w-4",
                          })}
                        </span>
                      )}
                      {action.label}
                    </DropdownMenuItem>
                  </React.Fragment>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];
  }, [columns, actions]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Table Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in all columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 lg:pb-0">
            {/* View Toggle - Hide on small screens */}
            <div className="hidden md:block">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value)}
              >
                <ToggleGroupItem
                  value="table"
                  disabled={isLoading}
                  aria-label="Table view"
                >
                  <LayoutList className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="grid"
                  disabled={isLoading}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px] shrink-0">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span>All Status</span>
                  </div>
                </SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal shrink-0",
                    !dateRange.from && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={isLoading}
                />
              </PopoverContent>
            </Popover>
            {(searchQuery || statusFilter !== "all" || dateRange.from) && (
              <Button
                variant="ghost"
                className="h-9 px-2 lg:px-3 shrink-0"
                onClick={clearFilters}
                disabled={isLoading}
              >
                Clear
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {onCreateNew && (
          <Button
            onClick={onCreateNew}
            className="shrink-0 w-full lg:w-auto"
            disabled={isLoading}
          >
            {createButtonText}
          </Button>
        )}
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <div className="rounded-md border bg-card hidden md:block">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {columnsWithActions.map((column) => (
                    <TableHead
                      key={column.key}
                      className="whitespace-nowrap font-semibold text-muted-foreground"
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <LoadingSpinner />
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columnsWithActions.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8" />
                        <p>No results found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((row, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        "transition-colors hover:bg-muted/50",
                        index % 2 === 0 ? "bg-white" : "bg-muted/20"
                      )}
                    >
                      {columnsWithActions.map((column) => (
                        <TableCell key={column.key} className="py-3">
                          {column.render
                            ? column.render(row[column.key], row)
                            : row[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <GridView
          data={currentData}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          gridClassName="mt-2"
        />
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => setItemsPerPage(Number(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 30, 50, 100].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
            entries
          </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Page {currentPage}</span>
            <span className="text-sm text-muted-foreground">
              of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || isLoading}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { DataTable };
