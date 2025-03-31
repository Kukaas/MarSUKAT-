import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const MARINDUQUE_MUNICIPALITIES = [
  "Boac",
  "Buenavista",
  "Gasan",
  "Mogpog",
  "Santa Cruz",
  "Torrijos"
];

const POSITIONS = [
  "Pattern Maker",
  "Tailoring Specialist",
  "Cutting Specialist",
  "Sewing Machine Operator",
  "Quality Control Inspector",
  "Garment Technician",
  "Embroidery Specialist",
  "Finishing Specialist",
  "Alteration Specialist",
  "Production Supervisor"
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  contactNumber: z.string()
    .regex(/^(\+63|0)[\d]{10}$/, "Contact number must start with +63 or 0 followed by 10 digits"),
  positions: z.array(z.string()).min(1, "At least one position is required"),
  municipality: z.enum(MARINDUQUE_MUNICIPALITIES, {
    errorMap: () => ({ message: "Please select a valid municipality" })
  }),
  barangay: z.string().min(1, "Barangay is required"),
});

const EmployeeForm = ({
  initialData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      contactNumber: initialData?.contactNumber || "",
      positions: initialData?.positions || [],
      municipality: initialData?.municipality || "",
      barangay: initialData?.barangay || "",
    },
    mode: "onTouched",
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        contactNumber: initialData.contactNumber || "",
        positions: initialData.positions || [],
        municipality: initialData.municipality || "",
        barangay: initialData.barangay || "",
      });
    }
  }, [initialData, form]);

  const municipalityOptions = MARINDUQUE_MUNICIPALITIES.map(municipality => ({
    value: municipality,
    label: municipality
  }));

  return (
    <Form {...form}>
      <form
        id="employeeForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="space-y-8">
          {/* Main Form Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormInput
              form={form}
              name="name"
              label="Full Name"
              placeholder="Enter full name"
              icon={User}
              required
              disabled={isSubmitting}
            />

            <FormInput
              form={form}
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email address"
              icon={Mail}
              required
              disabled={isSubmitting}
            />

            <FormInput
              form={form}
              name="contactNumber"
              label="Contact Number"
              placeholder="+63 or 0 followed by 10 digits"
              icon={Phone}
              required
              disabled={isSubmitting}
            />

            <FormSelect
              form={form}
              name="municipality"
              label="Municipality"
              placeholder="Select municipality"
              options={municipalityOptions}
              icon={MapPin}
              required
              disabled={isSubmitting}
            />

            <FormInput
              form={form}
              name="barangay"
              label="Barangay"
              placeholder="Enter barangay"
              icon={MapPin}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Positions Checkbox Group */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="positions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Positions</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {POSITIONS.map((position) => (
                      <FormField
                        key={position}
                        control={form.control}
                        name="positions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={position}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(position)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, position])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== position
                                          )
                                        )
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {position}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EmployeeForm;
