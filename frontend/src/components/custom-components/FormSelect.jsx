import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isChromeBrowser } from "@/lib/utils";

const FormSelect = ({
  form,
  name,
  label,
  placeholder,
  options,
  icon: Icon,
  className,
  ...props
}) => {
  const isChrome = isChromeBrowser();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-sm font-medium text-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              )}
              {isChrome ? (
                <div className="relative">
                  <select
                    className={`${
                      Icon ? "pl-10" : "pl-3"
                    } flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background pr-10 appearance-none w-full sm:w-[315px]`}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    {...props}
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {!field.value && (
                      <option
                        value=""
                        disabled
                        className="text-muted-foreground"
                      >
                        {placeholder}
                      </option>
                    )}
                    {options.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="text-foreground"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className={`h-4 w-4 opacity-50 ${
                        props.disabled ? "opacity-30" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              ) : (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  {...props}
                >
                  <SelectTrigger
                      className={`${
                        Icon ? "pl-10" : ""
                      } h-11 bg-background border-input ring-offset-background focus:ring-ring 
                      w-full sm:max-w-[380px] max-w-full whitespace-normal break-words`}
                    >
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};

export default FormSelect;
