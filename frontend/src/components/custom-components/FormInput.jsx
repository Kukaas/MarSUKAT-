import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormInput = ({
  form,
  name,
  label,
  placeholder,
  type = "text",
  icon: Icon,
  className,
  ...props
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                className={`${
                  Icon ? "pl-10" : ""
                } h-11 bg-background border-input ring-offset-background focus-visible:ring-ring ${className}`}
                type={type}
                placeholder={placeholder}
                {...field}
                {...props}
              />
            </div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};

export default FormInput;
