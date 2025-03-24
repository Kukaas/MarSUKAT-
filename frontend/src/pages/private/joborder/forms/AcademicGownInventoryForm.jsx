import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import ImageUpload from "@/components/custom-components/ImageUpload";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Box, Ruler, AlertCircle } from "lucide-react";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";

const formSchema = z.object({
  level: z.string().min(1, "Level is required"),
  productType: z.string().min(1, "Product type is required"),
  size: z.string().min(1, "Size is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  status: z.string(),
  image: z
    .object({
      filename: z.string(),
      contentType: z.string(),
      data: z.string(),
    })
    .optional()
    .nullable(),
});

export function AcademicGownInventoryForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const [levels, setLevels] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [initialImage, setInitialImage] = useState(formData?.image || null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: formData?.level || "",
      productType: formData?.productType || "",
      size: formData?.size || "",
      quantity: formData?.quantity || "",
      status: formData?.status || "Available",
      image: formData?.image || null,
    },
    mode: "onTouched",
  });

  // Fetch options on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [levelsData, sizesData, gownTypesData] = await Promise.all([
          systemMaintenanceAPI.getAllLevels(),
          systemMaintenanceAPI.getAllSizes(),
          systemMaintenanceAPI.getAllAcademicGownTypes(),
        ]);

        // Sort levels alphabetically
        setLevels(
          levelsData
            .sort((a, b) => a.level.localeCompare(b.level))
            .map((item) => ({
              value: item.level,
              label: item.level,
            }))
        );

        // Sort sizes alphabetically
        setSizes(
          sizesData
            .sort((a, b) => a.size.localeCompare(b.size))
            .map((item) => ({
              value: item.size,
              label: item.size,
            }))
        );

        // Get unique product types from gown types
        const uniqueProductTypes = [
          ...new Set(gownTypesData.map((item) => item.productType)),
        ];
        setProductTypes(
          uniqueProductTypes
            .sort((a, b) => a.localeCompare(b))
            .map((type) => ({
              value: type,
              label: type,
            }))
        );
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  // Update form when formData changes
  useEffect(() => {
    if (formData) {
      setInitialImage(formData.image || null);
      form.reset({
        level: formData.level || "",
        productType: formData.productType || "",
        size: formData.size || "",
        quantity: formData.quantity || "",
        status: formData.status || "Available",
        image: formData.image || null,
      });
    }
  }, [formData, form]);

  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Low Stock", label: "Low Stock" },
    { value: "Out of Stock", label: "Out of Stock" },
  ];

  const handleSubmit = async (data) => {
    try {
      // If no new image is uploaded, keep the existing one
      if (!data.image && initialImage) {
        data.image = initialImage;
      }
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        id="academicGownInventoryForm"
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
              name="level"
              label="Level"
              placeholder="Select level"
              options={levels}
              icon={GraduationCap}
              required
              disabled={isSubmitting}
            />

            <FormSelect
              form={form}
              name="productType"
              label="Product Type"
              placeholder="Select product type"
              options={productTypes}
              icon={Box}
              required
              disabled={isSubmitting}
            />

            <FormSelect
              form={form}
              name="size"
              label="Size"
              placeholder="Select size"
              options={sizes}
              icon={Ruler}
              required
              disabled={isSubmitting}
            />

            <FormInput
              form={form}
              name="quantity"
              label="Quantity"
              type="number"
              min="0"
              placeholder="Enter quantity"
              icon={Box}
              required
              disabled={isSubmitting}
            />

            <FormSelect
              form={form}
              name="status"
              label="Status"
              options={statusOptions}
              icon={AlertCircle}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Image Upload Section */}
          <div className="border rounded-lg p-6 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <ImageUpload
              form={form}
              name="image"
              label="Academic Gown Image"
              disabled={isSubmitting}
              className="w-full"
              defaultValue={initialImage}
            />
          </div>
        </div>
      </form>
    </Form>
  );
} 