import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import ImageUpload from "@/components/custom-components/ImageUpload";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GraduationCap,
  Shirt,
  Ruler,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";

const formSchema = z.object({
  level: z.string().min(1, "Level is required"),
  productType: z.string().min(1, "Product type is required"),
  size: z.string().min(1, "Size is required"),
  quantity: z.coerce
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .positive("Quantity must be positive")
    .multipleOf(0.01, "Maximum of 2 decimal places"),
  status: z.enum(["Available", "Low Stock", "Out of Stock"]),
  price: z.coerce
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .nonnegative("Price must be non-negative"),
  image: z
    .object({
      filename: z.string(),
      contentType: z.string(),
      data: z.string(),
    })
    .optional()
    .nullable(),
});

export function UniformInventoryForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const [productTypes, setProductTypes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState({
    productTypes: [],
    sizes: [],
    price: null,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: formData?.level || "",
      productType: formData?.productType || "",
      size: formData?.size || "",
      quantity: formData?.quantity || "",
      status: formData?.status || "Available",
      price: formData?.price || "",
      image: formData?.image,
    },
    mode: "onTouched",
  });

  // Fetch all product types on component mount
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const data = await systemMaintenanceAPI.getAllProductTypes();
        setProductTypes(data);

        // Extract unique levels
        const uniqueLevels = [
          ...new Set(data.map((item) => item.level)),
        ].sort();
        setLevels(
          uniqueLevels.map((level) => ({
            value: level,
            label: level,
          }))
        );
      } catch (error) {
        console.error("Error fetching product types:", error);
      }
    };
    fetchProductTypes();
  }, []);

  // Update filtered options when level changes
  useEffect(() => {
    const level = form.watch("level");
    if (level && productTypes.length > 0) {
      // Filter product types by selected level
      const levelProducts = productTypes.filter((item) => item.level === level);

      // Get unique product types for the selected level
      const uniqueProductTypes = [
        ...new Set(levelProducts.map((item) => item.productType)),
      ];
      setFilteredOptions((prev) => ({
        ...prev,
        productTypes: uniqueProductTypes.map((type) => ({
          value: type,
          label: type,
        })),
      }));
    } else {
      setFilteredOptions((prev) => ({
        ...prev,
        productTypes: [],
        sizes: [],
        price: null,
      }));
    }
  }, [form.watch("level"), productTypes]);

  // Update size options when product type changes
  useEffect(() => {
    const level = form.watch("level");
    const productType = form.watch("productType");

    if (level && productType && productTypes.length > 0) {
      // Filter sizes by selected level and product type
      const matchingProducts = productTypes.filter(
        (item) => item.level === level && item.productType === productType
      );

      // Get sizes for the selected combination
      const availableSizes = matchingProducts.map((item) => ({
        value: item.size,
        label: item.size,
      }));

      setFilteredOptions((prev) => ({
        ...prev,
        sizes: availableSizes,
      }));
    } else {
      setFilteredOptions((prev) => ({
        ...prev,
        sizes: [],
        price: null,
      }));
    }
  }, [form.watch("level"), form.watch("productType"), productTypes]);

  // Update price when size changes
  useEffect(() => {
    const level = form.watch("level");
    const productType = form.watch("productType");
    const size = form.watch("size");

    if (level && productType && size && productTypes.length > 0) {
      const matchingProduct = productTypes.find(
        (item) =>
          item.level === level &&
          item.productType === productType &&
          item.size === size
      );

      if (matchingProduct) {
        form.setValue("price", matchingProduct.price);
      }
    }
  }, [
    form.watch("level"),
    form.watch("productType"),
    form.watch("size"),
    productTypes,
  ]);

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
        id="uniformInventoryForm"
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
              options={filteredOptions.productTypes}
              icon={Shirt}
              required
              disabled={isSubmitting || !form.watch("level")}
            />

            <FormSelect
              form={form}
              name="size"
              label="Size"
              placeholder="Select a size"
              options={filteredOptions.sizes}
              icon={Ruler}
              required
              disabled={isSubmitting || !form.watch("productType")}
            />

            <FormInput
              form={form}
              name="price"
              label="Price"
              type="number"
              icon={DollarSign}
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
              label="Uniform Image"
              disabled={isSubmitting}
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
