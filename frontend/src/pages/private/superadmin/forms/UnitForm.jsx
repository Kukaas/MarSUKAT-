import FormInput from "@/components/custom-components/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  unit: z.string().min(1, "Unit name is required"),
});

export function UnitForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: formData?.unit || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        unit: formData.unit || "",
      });
    }
  }, [formData, form]);

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        id="unitForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {isEdit && formData?.unitId && (
          <FormInput
            form={form}
            name="unitId"
            label="Unit ID"
            value={formData.unitId}
            disabled
          />
        )}
        <FormInput
          form={form}
          name="unit"
          label="Unit"
          placeholder="Enter unit name (e.g., Pieces, Kilograms)"
          required
          disabled={isSubmitting}
        />
      </form>
    </Form>
  );
}
