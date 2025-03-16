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
                <Icon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-8"
                  disabled={disabled}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
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
                      "w-full pl-3 text-left font-normal flex justify-start items-center",
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
                  disabled={disabled}
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
