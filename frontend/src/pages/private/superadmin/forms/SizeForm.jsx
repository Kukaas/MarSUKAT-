import FormInput from "@/components/custom-components/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  size: z.string().min(1, "Size name is required"),
});

export function SizeForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: formData?.size || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        size: formData.size || "",
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
        id="sizeForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {isEdit && formData?.sizeId && (
          <FormInput
            form={form}
            name="sizeId"
            label="Size ID"
            value={formData.sizeId}
            disabled
          />
        )}
        <FormInput
          form={form}
          name="size"
          label="Size"
          placeholder="Enter size name (e.g., Small, Medium, Large)"
          required
          disabled={isSubmitting}
        />
      </form>
    </Form>
  );
}
