import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, isChromeBrowser } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FormDateInput = ({
  form,
  name,
  label,
  placeholder = "Pick a date",
  icon: Icon = CalendarIcon,
  required = false,
  disabled = false,
  className,
  disableFutureDates = false,
}) => {
  const isChrome = isChromeBrowser();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-left">{label}</FormLabel>
          {isChrome ? (
            // Native date input for Chrome
            <FormControl>
              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer"
                  onClick={() => {
                    const input = document.querySelector(
                      `input[name="${name}"]`
                    );
                    input?.showPicker();
                  }}
                >
                  <Icon className="opacity-70 dark:opacity-60 h-4 w-4" />
                </div>
                <Input
                  type="date"
                  className={cn(
                    "h-11 pl-10 [color-scheme:inherit] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer",
                    "text-transparent"
                  )}
                  disabled={disabled}
                  {...field}
                  value={field.value || ""}
                  placeholder="Pick a date"
                  {...(disableFutureDates && {
                    max: format(new Date(), "yyyy-MM-dd"),
                  })}
                  onChange={(e) => {
                    field.onChange(e.target.value);
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
                  {field.value ? (
                    format(new Date(field.value), "MMMM d, yyyy")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                </div>
              </div>
            </FormControl>
          ) : (
            // Calendar popup for other browsers
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal flex justify-start items-center h-11",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={disabled}
                  >
                    <Icon className="h-4 w-4 mr-2 shrink-0" />
                    {field.value ? (
                      format(new Date(field.value), "MMMM d, yyyy")
                    ) : (
                      <span>{placeholder}</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  disabled={
                    disableFutureDates ? (date) => date > new Date() : undefined
                  }
                  defaultMonth={
                    field.value ? new Date(field.value) : new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormDateInput;
