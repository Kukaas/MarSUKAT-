import FormInput from "@/components/custom-components/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  department: z.string().min(1, "Department name is required"),
  description: z.string().min(1, "Description is required"),
});

export function DepartmentForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: formData?.department || "",
      description: formData?.description || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        department: formData.department || "",
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
        id="departmentForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {isEdit && formData?.departmentId && (
          <FormInput
            form={form}
            name="departmentId"
            label="Department ID"
            value={formData.departmentId}
            disabled
          />
        )}
        <FormInput
          form={form}
          name="department"
          label="Department"
          placeholder="Enter department name (e.g., Computer Science, Engineering)"
          required
          disabled={isSubmitting}
        />
        <FormInput
          form={form}
          name="description"
          label="Description"
          placeholder="Enter department description"
          required
          disabled={isSubmitting}
        />
      </form>
    </Form>
  );
}
