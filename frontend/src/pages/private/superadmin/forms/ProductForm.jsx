import FormSelect from "@/components/custom-components/FormSelect";
import ImageUpload from "@/components/custom-components/ImageUpload";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { GraduationCap, Package } from "lucide-react";
import FormInput from "@/components/custom-components/FormInput";
import { MultiImageUpload } from "@/components/custom-components/MultiImageUpload";

const formSchema = z.object({
  level: z.string().min(1, "Level is required"),
  productType: z.string().min(1, "Product type is required"),
  images: z
    .array(
      z.object({
        label: z.string(),
        filename: z.string(),
        contentType: z.string(),
        data: z.string(),
      })
    )
    .optional()
    .default([])
    .transform((images) =>
      // Filter out empty images
      images.filter((img) => img.data && img.filename)
    ),
});

export function ProductForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const [levels, setLevels] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: formData?.level || "",
      productType: formData?.productType || "",
      images: formData?.images || [{ filename: "", contentType: "", data: "" }],
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        level: formData.level || "",
        productType: formData.productType || "",
        images:
          formData.images?.length > 0
            ? formData.images
            : [{ filename: "", contentType: "", data: "" }],
      });
    }
  }, [formData, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await systemMaintenanceAPI.getAllProductTypes();

        // Extract unique levels
        const uniqueLevels = [...new Set(data.map((item) => item.level))]
          .sort()
          .map((level) => ({
            value: level,
            label: level,
          }));

        // Extract unique product types
        const uniqueProductTypes = [
          ...new Set(data.map((item) => item.productType)),
        ]
          .sort()
          .map((type) => ({
            value: type,
            label: type,
          }));

        setLevels(uniqueLevels);
        setProductTypes(uniqueProductTypes);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (data) => {
    try {
      // Filter out any empty images before submitting
      const cleanedData = {
        ...data,
        images: data.images.filter((img) => img.data && img.filename),
      };
      await onSubmit(cleanedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        id="productForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
      >
        <div className="space-y-6">
          {/* Product ID (if editing) */}
          {isEdit && formData?.productId && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <FormInput
                form={form}
                name="productId"
                label="Product ID"
                value={formData.productId}
                disabled
              />
            </div>
          )}

          {/* Main Form Fields */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <FormSelect
              form={form}
              name="level"
              label="Level"
              placeholder="Select a level"
              options={levels}
              icon={GraduationCap}
              required
              disabled={isSubmitting}
            />

            <FormSelect
              form={form}
              name="productType"
              label="Product Type"
              placeholder="Select a product type"
              options={productTypes}
              icon={Package}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Image Upload Section */}
          <div className="border rounded-lg p-4 sm:p-6 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <MultiImageUpload
              form={form}
              name="images"
              label="Product Images"
              disabled={isSubmitting}
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
