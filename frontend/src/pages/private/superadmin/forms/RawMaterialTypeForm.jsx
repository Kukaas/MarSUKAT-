import FormInput from "@/components/custom-components/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export function RawMaterialTypeForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: formData?.name || "",
      description: formData?.description || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        name: formData.name || "",
        description: formData.description || "",
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
        id="rawMaterialTypeForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {isEdit && formData?.typeId && (
          <FormInput
            form={form}
            name="typeId"
            label="Type ID"
            value={formData.typeId}
            disabled
          />
        )}
        <FormInput
          form={form}
          name="name"
          label="Name"
          placeholder="Enter raw material type name"
          required
          disabled={isSubmitting}
        />
        <FormInput
          form={form}
          name="description"
          label="Description"
          placeholder="Enter description (optional)"
          disabled={isSubmitting}
        />
      </form>
    </Form>
  );
}
