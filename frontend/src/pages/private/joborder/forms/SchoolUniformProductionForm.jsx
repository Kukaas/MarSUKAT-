import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import FormDateInput from "@/components/custom-components/FormDateInput";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/custom-components/EmptyState";
import { StatusMessage } from "@/components/custom-components/StatusMessage";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const formRef = useRef(null);

  // Scroll to top when inventory issues appear
  useEffect(() => {
    if (inventoryIssues && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [inventoryIssues]);

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
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductTypes();
  }, []);

  // Update filtered options when level changes
  useEffect(() => {
    const level = form.watch("level");
    if (level && productTypes.length > 0) {
      setIsLoadingProductTypes(true);
      try {
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
        // Reset product type and size when level changes
        form.setValue("productType", "");
        form.setValue("size", "");
      } finally {
        setIsLoadingProductTypes(false);
      }
    }
  }, [form.watch("level"), productTypes]);

  // Update size options when product type changes
  useEffect(() => {
    const level = form.watch("level");
    const productType = form.watch("productType");

    if (level && productType && productTypes.length > 0) {
      setIsLoadingSizes(true);
      try {
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
        // Reset size when product type changes
        form.setValue("size", "");
      } finally {
        setIsLoadingSizes(false);
      }
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
        ref={formRef}
        id="schoolUniformProductionForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Add Inventory Issues Display at the top */}
        {inventoryIssues && (
          <StatusMessage
            type="warning"
            title="Raw Material Inventory Issues"
            message={
              inventoryIssues.missingMaterials.length > 0
                ? "Some materials are missing from inventory."
                : "Some materials have insufficient quantities."
            }
            steps={[
              ...(inventoryIssues.missingMaterials.length > 0
                ? inventoryIssues.missingMaterials.map(
                    (material) =>
                      `${material.type} (${material.category}) - ${material.error}`
                  )
                : []),
              ...(inventoryIssues.insufficientMaterials.length > 0
                ? inventoryIssues.insufficientMaterials.map(
                    (material) =>
                      `${material.type} (${material.category}): Available: ${
                        material.available
                      } ${material.unit}, Needed: ${material.needed} ${
                        material.unit
                      }, Shortage: ${material.shortageAmount} ${material.unit}`
                  )
                : []),
            ]}
            reminder="Please ensure all required materials are available in sufficient quantities before proceeding."
          />
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
              isLoading={isLoading}
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
              isLoading={isLoadingProductTypes}
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
              isLoading={isLoadingSizes}
            />

            <FormInput
              form={form}
              name="quantity"
              label="Production Quantity"
              type="number"
              placeholder="Enter number of uniforms"
              icon={Scale}
              required
              disabled={isSubmitting || !form.watch("size")}
            />

            <FormDateInput
              form={form}
              name="productionDateFrom"
              label="Start Date"
              placeholder="Select start date"
              icon={Calendar}
              required
              disabled={isSubmitting || !form.watch("size")}
              disableFutureDates={true}
            />

            <FormDateInput
              form={form}
              name="productionDateTo"
              label="End Date"
              placeholder="Select end date"
              icon={Calendar}
              required
              disabled={isSubmitting || !form.watch("size")}
              disableFutureDates={true}
            />
          </div>

          {/* Raw Materials Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Raw Materials Required</h3>
            {selectedProductType ? (
              selectedProductType.rawMaterialsUsed.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedProductType.rawMaterialsUsed.map(
                    (material, index) => (
                      <Card key={material._id || index} className="bg-muted/50">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {material.category}
                            </span>
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
                    )
                  )}
                </div>
              ) : (
                <EmptyState 
                  message="No raw materials have been specified for this product type."
                />
              )
            ) : (
              <EmptyState 
                message={isLoading || isLoadingProductTypes || isLoadingSizes ? 
                  "Loading..." : 
                  "Select a level, product type, and size to view required raw materials."}
              />
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
