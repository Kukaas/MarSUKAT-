import FormInput from "@/components/custom-components/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  category: z.string().min(1, "Category name is required"),
});

export function CategoryForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: formData?.category || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        category: formData.category || "",
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
        id="categoryForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {isEdit && formData?.categoryId && (
          <FormInput
            form={form}
            name="categoryId"
            label="Category ID"
            value={formData.categoryId}
            disabled
          />
        )}
        <FormInput
          form={form}
          name="category"
          label="Category"
          placeholder="Enter category name (e.g., Electronics, Clothing)"
          required
          disabled={isSubmitting}
        />
      </form>
    </Form>
  );
}
