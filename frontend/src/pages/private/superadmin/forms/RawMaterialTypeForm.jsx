import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { Tag, Ruler } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().optional(),
});

// Helper function to sort options alphabetically
const sortOptionsAlphabetically = (data, valueKey) => {
  return [...data]
    .sort((a, b) =>
      a[valueKey]
        .trim()
        .localeCompare(b[valueKey].trim(), "en", { sensitivity: "base" })
    )
    .map((item) => ({
      value: item[valueKey],
      label: item[valueKey],
    }));
};

export function RawMaterialTypeForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: formData?.name || "",
      category: formData?.category || "",
      unit: formData?.unit || "",
      description: formData?.description || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        name: formData.name || "",
        category: formData.category || "",
        unit: formData.unit || "",
        description: formData.description || "",
      });
    }
  }, [formData, form]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesData, unitsData] = await Promise.all([
          systemMaintenanceAPI.getAllCategories(),
          systemMaintenanceAPI.getAllUnits(),
        ]);

        // Sort categories alphabetically
        const sortedCategories = sortOptionsAlphabetically(
          categoriesData,
          "category"
        );
        setCategories(sortedCategories);

        // Sort units alphabetically
        const sortedUnits = sortOptionsAlphabetically(unitsData, "unit");
        setUnits(sortedUnits);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
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
        <FormSelect
          form={form}
          name="unit"
          label="Unit"
          placeholder="Select a unit"
          options={units}
          icon={Ruler}
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
