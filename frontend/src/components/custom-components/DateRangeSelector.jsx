import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, isChromeBrowser } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onGenerate,
  isLoading = false,
  className,
}) => {
  const isChrome = isChromeBrowser();
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          {isChrome ? (
            // Native date input for Chrome
            <div className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer"
                onClick={() => {
                  const input = document.querySelector(`input[name="startDate"]`);
                  input?.showPicker();
                }}
              >
                <CalendarIcon className="opacity-70 dark:opacity-60 h-4 w-4" />
              </div>
              <Input
                type="date"
                name="startDate"
                className={cn(
                  "h-11 pl-10 [color-scheme:inherit] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer",
                  "text-transparent"
                )}
                value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                placeholder="Start date"
                onChange={(e) => {
                  onStartDateChange(new Date(e.target.value));
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.target.showPicker();
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
              />
              <div className="absolute inset-0 pointer-events-none pl-10 flex items-center text-sm">
                {startDate ? (
                  format(startDate, "MMMM d, yyyy")
                ) : (
                  <span className="text-muted-foreground">Select start date</span>
                )}
              </div>
            </div>
          ) : (
            // Calendar popup for other browsers
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal flex justify-start items-center h-11",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2 shrink-0" />
                  {startDate ? (
                    format(startDate, "MMMM d, yyyy")
                  ) : (
                    <span>Select start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={onStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          {isChrome ? (
            // Native date input for Chrome
            <div className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer"
                onClick={() => {
                  const input = document.querySelector(`input[name="endDate"]`);
                  input?.showPicker();
                }}
              >
                <CalendarIcon className="opacity-70 dark:opacity-60 h-4 w-4" />
              </div>
              <Input
                type="date"
                name="endDate"
                className={cn(
                  "h-11 pl-10 [color-scheme:inherit] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer",
                  "text-transparent"
                )}
                value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                placeholder="End date"
                onChange={(e) => {
                  onEndDateChange(new Date(e.target.value));
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.target.showPicker();
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
              />
              <div className="absolute inset-0 pointer-events-none pl-10 flex items-center text-sm">
                {endDate ? (
                  format(endDate, "MMMM d, yyyy")
                ) : (
                  <span className="text-muted-foreground">Select end date</span>
                )}
              </div>
            </div>
          ) : (
            // Calendar popup for other browsers
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal flex justify-start items-center h-11",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2 shrink-0" />
                  {endDate ? (
                    format(endDate, "MMMM d, yyyy")
                  ) : (
                    <span>Select end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  initialFocus
                  disabled={(date) => date < startDate}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          onClick={onGenerate}
          disabled={isLoading || !startDate || !endDate}
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </div>
  );
};

export default DateRangeSelector; 