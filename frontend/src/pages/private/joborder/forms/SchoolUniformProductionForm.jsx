import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import FormDateInput from "@/components/custom-components/FormDateInput";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GraduationCap,
  Shirt,
  Ruler,
  Calendar,
  Package,
  Box,
  Scale,
  AlertCircle,
} from "lucide-react";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  level: z.string().min(1, "Level is required"),
  productType: z.string().min(1, "Product type is required"),
  size: z.string().min(1, "Size is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive"),
  productionDateFrom: z.string().min(1, "Start date is required"),
  productionDateTo: z.string().min(1, "End date is required"),
  rawMaterialsUsed: z.array(
    z.object({
      category: z.string(),
      type: z.string(),
      quantity: z.number(),
      unit: z.string(),
    })
  ),
});

export function SchoolUniformProductionForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
  inventoryIssues = null,
}) {
  const [productTypes, setProductTypes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState({
    productTypes: [],
    sizes: [],
  });
  const [selectedProductType, setSelectedProductType] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: formData?.level || "",
      productType: formData?.productType || "",
      size: formData?.size || "",
      quantity: formData?.quantity || "",
      productionDateFrom: formData?.productionDateFrom || "",
      productionDateTo: formData?.productionDateTo || "",
      rawMaterialsUsed: formData?.rawMaterialsUsed || [],
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
      const levelProducts = productTypes.filter((item) => item.level === level);
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
    }
  }, [form.watch("level"), productTypes]);

  // Update size options when product type changes
  useEffect(() => {
    const level = form.watch("level");
    const productType = form.watch("productType");

    if (level && productType && productTypes.length > 0) {
      const matchingProducts = productTypes.filter(
        (item) => item.level === level && item.productType === productType
      );
      setFilteredOptions((prev) => ({
        ...prev,
        sizes: matchingProducts.map((item) => ({
          value: item.size,
          label: item.size,
        })),
      }));
    }
  }, [form.watch("level"), form.watch("productType"), productTypes]);

  // Update raw materials when size is selected
  useEffect(() => {
    const level = form.watch("level");
    const productType = form.watch("productType");
    const size = form.watch("size");

    if (level && productType && size && productTypes.length > 0) {
      const selectedProduct = productTypes.find(
        (item) =>
          item.level === level &&
          item.productType === productType &&
          item.size === size
      );

      if (selectedProduct) {
        setSelectedProductType(selectedProduct);
        form.setValue("rawMaterialsUsed", selectedProduct.rawMaterialsUsed);
      }
    }
  }, [
    form.watch("level"),
    form.watch("productType"),
    form.watch("size"),
    productTypes,
  ]);

  // Update the form when formData changes
  useEffect(() => {
    if (formData) {
      form.reset({
        level: formData.level || "",
        productType: formData.productType || "",
        size: formData.size || "",
        quantity: formData.quantity || "",
        productionDateFrom: formData.productionDateFrom || "",
        productionDateTo: formData.productionDateTo || "",
        rawMaterialsUsed: formData.rawMaterialsUsed || [],
      });
    }
  }, [formData, form.reset]);

  return (
    <Form {...form}>
      <form
        id="schoolUniformProductionForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Add Inventory Issues Display at the top */}
        {inventoryIssues && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Raw Material Inventory Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventoryIssues.missingMaterials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">
                    Missing Materials:
                  </h4>
                  <ul className="list-inside list-disc space-y-1">
                    {inventoryIssues.missingMaterials.map((material, index) => (
                      <li key={index} className="text-sm text-red-600">
                        {material.type} ({material.category}) - {material.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {inventoryIssues.insufficientMaterials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">
                    Insufficient Quantities:
                  </h4>
                  <ul className="list-inside list-disc space-y-1">
                    {inventoryIssues.insufficientMaterials.map(
                      (material, index) => (
                        <li key={index} className="text-sm text-red-600">
                          {material.type} ({material.category}):
                          <ul className="ml-4 list-inside list-none">
                            <li>
                              Available: {material.available} {material.unit}
                            </li>
                            <li>
                              Needed: {material.needed} {material.unit}
                            </li>
                            <li>
                              Shortage: {material.shortageAmount}{" "}
                              {material.unit}
                            </li>
                          </ul>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          {/* Production ID (if editing) */}
          {isEdit && formData?.productionId && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <FormInput
                form={form}
                name="productionId"
                label="Production ID"
                value={formData.productionId}
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
              name="quantity"
              label="Production Quantity"
              type="number"
              placeholder="Enter number of uniforms"
              icon={Scale}
              required
              disabled={isSubmitting}
            />

            <FormDateInput
              form={form}
              name="productionDateFrom"
              label="Start Date"
              placeholder="Select start date"
              icon={Calendar}
              required
              disabled={isSubmitting}
            />

            <FormDateInput
              form={form}
              name="productionDateTo"
              label="End Date"
              placeholder="Select end date"
              icon={Calendar}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Raw Materials Section */}
          {selectedProductType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Raw Materials Required</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {selectedProductType.rawMaterialsUsed.map((material, index) => (
                  <Card key={material._id || index} className="bg-muted/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">{material.category}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-muted-foreground" />
                          <span>{material.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-muted-foreground" />
                          <span>{material.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span>{material.unit}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
