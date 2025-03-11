import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { Tag } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

export function RawMaterialTypeForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const [categories, setCategories] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: formData?.name || "",
      category: formData?.category || "",
      description: formData?.description || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        name: formData.name || "",
        category: formData.category || "",
        description: formData.description || "",
      });
    }
  }, [formData, form]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await systemMaintenanceAPI.getAllCategories();
        setCategories(
          data.map((cat) => ({
            value: cat.category,
            label: cat.category,
          }))
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
        <FormSelect
          form={form}
          name="category"
          label="Category"
          placeholder="Select a category"
          options={categories}
          icon={Tag}
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
