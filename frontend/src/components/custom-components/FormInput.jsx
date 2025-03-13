import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const FormInput = ({
  form,
  name,
  label,
  placeholder,
  type = "text",
  icon: Icon,
  className,
  isTextarea = false,
  rows,
  ...props
}) => {
  // Filter out any non-DOM props
  const { textarea, ...restProps } = props;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const inputProps = {
          ...field,
          ...restProps,
          placeholder,
          className: `${
            isTextarea ? "min-h-[80px]" : `h-11 ${Icon ? "pl-10" : ""}`
          } bg-background border-input ring-offset-background focus-visible:ring-ring ${
            className || ""
          }`,
        };

        // Handle label rendering
        const renderLabel = () => {
          if (typeof label === "function") {
            return label();
          }
          return label;
        };

        return (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              {renderLabel()}
            </FormLabel>
            <FormControl>
              <div className="relative">
                {Icon && !isTextarea && (
                  <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}
                {isTextarea ? (
                  <Textarea rows={rows} {...inputProps} />
                ) : (
                  <Input type={type} {...inputProps} />
                )}
              </div>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        );
      }}
    />
  );
};

export default FormInput;
