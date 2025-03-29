import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import ImageUpload from "@/components/custom-components/ImageUpload";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { Tag, Package, AlertCircle } from "lucide-react";

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  rawMaterialType: z.string().min(1, "Material type is required"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.coerce
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .positive("Quantity must be positive")
    .multipleOf(0.01, "Maximum of 2 decimal places"),
  status: z.enum(["Available", "Low Stock", "Out of Stock"]),
  image: z
    .object({
      filename: z.string(),
      contentType: z.string(),
      data: z.string(),
    })
    .optional()
    .nullable(),
});

const RawMaterialInventoryForm = ({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const [allMaterialTypes, setAllMaterialTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMaterialTypes, setIsLoadingMaterialTypes] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: formData?.category || "",
      rawMaterialType: formData?.rawMaterialType || "",
      unit: formData?.unit || "",
      quantity: formData?.quantity || "",
      status: formData?.status || "Available",
      image: formData?.image,
    },
    mode: "onTouched",
  });

  // Reset form when formData changes
  useEffect(() => {
    if (formData) {
      form.reset({
        category: formData.category || "",
        rawMaterialType: formData.rawMaterialType || "",
        unit: formData.unit || "",
        quantity: formData.quantity || "",
        status: formData.status || "Available",
        image: formData.image,
      });
    }
  }, [formData, form]);

  // Fetch all material types and extract unique categories
  useEffect(() => {
    const fetchMaterialTypes = async () => {
      setIsLoading(true);
      try {
        const data = await systemMaintenanceAPI.getAllRawMaterialTypes();
        // Sort the raw data first by name
        const sortedData = data.sort((a, b) =>
          a.name.trim().localeCompare(b.name.trim())
        );
        setAllMaterialTypes(sortedData);

        // Extract unique categories and sort them
        const uniqueCategories = [...new Set(data.map((type) => type.category))]
          .sort()
          .map((category) => ({
            value: category,
            label: category,
          }));

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching material types:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterialTypes();
  }, []);

  // Filter material types when category changes
  useEffect(() => {
    const category = form.watch("category");
    if (category && allMaterialTypes.length > 0) {
      setIsLoadingMaterialTypes(true);
      try {
        const filteredTypes = allMaterialTypes
          .filter((type) => type.category === category)
          .map((type) => ({
            value: type._id,
            label: type.name.trim(), // Trim whitespace from labels
            unit: type.unit,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setMaterialTypes(filteredTypes);
      } finally {
        setIsLoadingMaterialTypes(false);
      }
    } else {
      setMaterialTypes([]);
    }
  }, [form.watch("category"), allMaterialTypes]);

  // Update unit when material type changes
  useEffect(() => {
    const materialType = form.watch("rawMaterialType");
    if (materialType) {
      const selectedType = materialTypes.find(
        (type) => type.value === materialType
      );
      if (selectedType) {
        form.setValue("unit", selectedType.unit);
      }
    }
  }, [form.watch("rawMaterialType"), materialTypes]);

  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Low Stock", label: "Low Stock" },
    { value: "Out of Stock", label: "Out of Stock" },
  ];

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
        id="rawMaterialInventoryForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
      >
        <div className="space-y-8">
          {/* Inventory ID (if editing) */}
          {isEdit && formData?.inventoryId && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <FormInput
                form={form}
                name="inventoryId"
                label="Inventory ID"
                value={formData.inventoryId}
                disabled
              />
            </div>
          )}

          {/* Main Form Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormSelect
              form={form}
              name="category"
              label="Category"
              placeholder="Select a category"
              options={categories}
              icon={Tag}
              required
              disabled={isSubmitting}
              isLoading={isLoading}
              onChange={(value) => {
                form.setValue("category", value);
                form.setValue("rawMaterialType", "");
                form.setValue("unit", "");
              }}
            />

            <FormSelect
              form={form}
              name="rawMaterialType"
              label="Material Type"
              placeholder="Select a material type"
              options={materialTypes}
              icon={Package}
              required
              disabled={isSubmitting || !form.watch("category")}
              isLoading={isLoadingMaterialTypes}
              onChange={(value) => {
                form.setValue("rawMaterialType", value);
                const selectedType = materialTypes.find(
                  (type) => type.value === value
                );
                if (selectedType) {
                  form.setValue("unit", selectedType.unit);
                }
              }}
            />

            <FormInput
              form={form}
              name="unit"
              label="Unit"
              disabled={true}
              className="bg-muted/50"
            />

            <FormInput
              form={form}
              name="quantity"
              label="Quantity"
              type="number"
              step="0.01"
              placeholder="Enter quantity"
              required
              disabled={isSubmitting || !form.watch("rawMaterialType")}
            />

            <FormSelect
              form={form}
              name="status"
              label="Status"
              options={statusOptions}
              icon={AlertCircle}
              required
              disabled={isSubmitting || !form.watch("rawMaterialType")}
            />
          </div>

          {/* Image Upload Section */}
          <div className="border rounded-lg p-6 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <ImageUpload
              form={form}
              name="image"
              label="Material Image"
              disabled={isSubmitting}
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default RawMaterialInventoryForm;
