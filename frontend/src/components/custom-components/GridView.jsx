import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

const EmptyState = ({ message = "No items to display." }) => (
  <div className="col-span-full min-h-[300px] md:min-h-[200px] relative bg-background rounded-md border">
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground p-4 text-center">
      <Search className="h-6 w-6 md:h-8 md:w-8" />
      <p className="text-sm md:text-base">{message}</p>
    </div>
  </div>
);

const GridView = ({
  data = [],
  columns = [],
  isLoading = false,
  gridClassName,
  cardClassName,
  actions = [],
  actionCategories,
  emptyMessage = "No items to display.",
}) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
          gridClassName
        )}
      >
        <div className="col-span-full">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
          gridClassName
        )}
      >
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        gridClassName
      )}
    >
      {data.map((item, index) => (
        <Card
          key={index}
          className={cn(
            "group hover:shadow-md transition-all duration-200",
            cardClassName
          )}
        >
          <CardHeader className="space-y-3 pb-3">
            {/* Header - First column (usually ID or title) */}
            <div className="flex items-center justify-between">
              <div className="font-medium text-foreground">
                {columns[0]?.render
                  ? columns[0].render(item[columns[0].key], item)
                  : item[columns[0].key]}
              </div>
              {(actions.length > 0 || actionCategories) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    {actionCategories
                      ? Object.entries(actionCategories).map(
                          (
                            [category, { label, actions: categoryActions }],
                            categoryIndex
                          ) => (
                            <React.Fragment key={category}>
                              {categoryIndex > 0 && <DropdownMenuSeparator />}
                              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                                {label}
                              </DropdownMenuLabel>
                              {categoryActions
                                .filter(
                                  (action) => !action.show || action.show(item)
                                )
                                .map((action) => (
                                  <DropdownMenuItem
                                    key={action.label}
                                    onClick={() => action.onClick(item)}
                                    className={cn(
                                      "cursor-pointer gap-2",
                                      action.variant === "destructive" &&
                                        "text-destructive"
                                    )}
                                  >
                                    {action.icon && (
                                      <span className="h-4 w-4">
                                        {React.createElement(action.icon, {
                                          className: "h-4 w-4",
                                        })}
                                      </span>
                                    )}
                                    {typeof action.label === "function"
                                      ? action.label(item)
                                      : action.label}
                                  </DropdownMenuItem>
                                ))}
                            </React.Fragment>
                          )
                        )
                      : actions
                          .filter((action) => !action.show || action.show(item))
                          .map((action, index) => (
                            <React.Fragment key={action.label}>
                              {index > 0 && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                onClick={() => action.onClick(item)}
                                className={cn(
                                  "cursor-pointer gap-2",
                                  action.variant === "destructive" &&
                                    "text-destructive"
                                )}
                              >
                                {action.icon && (
                                  <span className="h-4 w-4">
                                    {React.createElement(action.icon, {
                                      className: "h-4 w-4",
                                    })}
                                  </span>
                                )}
                                {typeof action.label === "function"
                                  ? action.label(item)
                                  : action.label}
                              </DropdownMenuItem>
                            </React.Fragment>
                          ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Status and Priority side by side if they exist */}
            <div className="flex flex-wrap gap-2">
              {columns.map((column) => {
                if (column.key === "status" || column.key === "priority") {
                  return (
                    <div key={column.key}>
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            <ScrollArea className="h-[140px] pr-4 -mr-4">
              {/* Other fields */}
              <div className="space-y-3">
                {columns.map((column) => {
                  // Skip already rendered fields
                  if (
                    column.key === columns[0].key ||
                    column.key === "status" ||
                    column.key === "priority"
                  ) {
                    return null;
                  }
                  return (
                    <div key={column.key} className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        {column.header}
                      </div>
                      <div className="text-foreground">
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export { GridView };
