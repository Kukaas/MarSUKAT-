import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";

const formSchema = z.object({
  level: z.string().min(1, "Level is required"),
  productType: z.string().min(1, "Product type is required"),
  size: z.string().min(1, "Size is required"),
  price: z.string().min(1, "Price is required"),
  rawMaterialsUsed: z.array(
    z.object({
      category: z.string().min(1, "Category is required"),
      type: z.string().min(1, "Type is required"),
      quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
      unit: z.string().min(1, "Unit is required"),
    })
  ),
});

export function ProductTypeForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const [levels, setLevels] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [prices, setPrices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [rawMaterialTypes, setRawMaterialTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState({});

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: formData?.level || "",
      productType: formData?.productType || "",
      size: formData?.size || "",
      price: formData?.price || "",
      rawMaterialsUsed: formData?.rawMaterialsUsed?.length
        ? formData.rawMaterialsUsed.map((material) => ({
            category: material.category || "",
            type: material.type || "",
            quantity: material.quantity || "",
            unit: material.unit || "",
          }))
        : [{ category: "", type: "", quantity: "", unit: "" }],
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rawMaterialsUsed",
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [levelsData, sizesData, pricesData, typesData, unitsData] =
          await Promise.all([
            systemMaintenanceAPI.getAllLevels(),
            systemMaintenanceAPI.getAllSizes(),
            systemMaintenanceAPI.getAllPrices(),
            systemMaintenanceAPI.getAllRawMaterialTypes(),
            systemMaintenanceAPI.getAllUnits(),
          ]);

        setLevels(levelsData.map((l) => ({ value: l.level, label: l.level })));
        setSizes(sizesData.map((s) => ({ value: s.size, label: s.size })));
        setPrices(
          pricesData.map((p) => ({
            value: p._id,
            label: `₱${p.price}`,
          }))
        );

        // Store raw material types
        setRawMaterialTypes(typesData);

        // Get unique categories from raw material types
        const uniqueCategories = [...new Set(typesData.map((t) => t.category))];
        setCategories(
          uniqueCategories.map((c) => ({
            value: c,
            label: c,
          }))
        );

        // If we're in edit mode, set up the filtered types for each material
        if (isEdit && formData?.rawMaterialsUsed) {
          formData.rawMaterialsUsed.forEach((material, index) => {
            if (material.category) {
              const typesForCategory = typesData
                .filter((type) => type.category === material.category)
                .map((type) => ({
                  value: type.name,
                  label: type.name,
                  unit: type.unit,
                }));
              setFilteredTypes((prev) => ({
                ...prev,
                [index]: typesForCategory,
              }));
            }
          });
        }

        setUnits(unitsData.map((u) => ({ value: u.unit, label: u.unit })));
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, [isEdit, formData]);

  useEffect(() => {
    if (formData) {
      console.log("Setting form data:", formData);
      form.reset({
        level: formData.level || "",
        productType: formData.productType || "",
        size: formData.size || "",
        price: formData.price || "",
        rawMaterialsUsed: formData.rawMaterialsUsed?.length
          ? formData.rawMaterialsUsed.map((material) => ({
              category: material.category || "",
              type: material.type || "",
              quantity: material.quantity || "",
              unit: material.unit || "",
            }))
          : [{ category: "", type: "", quantity: "", unit: "" }],
      });

      // Set up filtered types for each material
      if (formData.rawMaterialsUsed) {
        formData.rawMaterialsUsed.forEach((material, index) => {
          if (material.category) {
            handleCategoryChange(index, material.category);
          }
        });
      }
    }
  }, [formData, form]);

  // Handle category change
  const handleCategoryChange = (index, category) => {
    console.log("Handling category change:", { index, category });
    // Filter types for the selected category
    const typesForCategory = rawMaterialTypes
      .filter((type) => type.category === category)
      .map((type) => ({
        value: type.name,
        label: type.name,
        unit: type.unit,
      }));

    console.log("Types for category:", typesForCategory);

    // Update filtered types for this index
    setFilteredTypes((prev) => {
      const newState = {
        ...prev,
        [index]: typesForCategory,
      };
      return newState;
    });
  };

  // Handle type change to set the corresponding unit
  const handleTypeChange = (index, typeName) => {
    console.log("Handling type change:", { index, typeName });
    const selectedType = rawMaterialTypes.find(
      (type) => type.name === typeName
    );
    if (selectedType) {
      console.log("Found selected type:", selectedType);
      form.setValue(`rawMaterialsUsed.${index}.unit`, selectedType.unit);
    }
  };

  const handleSubmit = async (data) => {
    try {
      // No need to manually convert quantity as Zod handles it now
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        id="productTypeForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {isEdit && formData?.productTypeId && (
          <FormInput
            form={form}
            name="productTypeId"
            label="Product Type ID"
            value={formData.productTypeId}
            disabled
          />
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <FormSelect
            form={form}
            name="level"
            label="Level"
            placeholder="Select level"
            options={levels}
            required
            disabled={isSubmitting}
          />
          <FormInput
            form={form}
            name="productType"
            label="Product Type"
            placeholder="Enter product type name"
            required
            disabled={isSubmitting}
          />
          <FormSelect
            form={form}
            name="size"
            label="Size"
            placeholder="Select size"
            options={sizes}
            required
            disabled={isSubmitting}
          />
          <FormSelect
            form={form}
            name="price"
            label="Price"
            placeholder="Select price"
            options={prices}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between bg-background py-2">
            <h3 className="text-lg font-medium">Raw Materials</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ category: "", type: "", quantity: "", unit: "" })
              }
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 sm:grid-cols-2 p-4 border rounded-lg relative bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              >
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}

                <FormSelect
                  form={form}
                  name={`rawMaterialsUsed.${index}.category`}
                  label="Category"
                  placeholder="Select category"
                  options={categories}
                  required
                  disabled={isSubmitting}
                  onValueChange={(value) => {
                    console.log("Category selected:", value);
                    // Clear the type and unit fields
                    form.setValue(`rawMaterialsUsed.${index}.type`, "");
                    form.setValue(`rawMaterialsUsed.${index}.unit`, "");
                    // Set the new category
                    form.setValue(`rawMaterialsUsed.${index}.category`, value);
                    // Update filtered types
                    handleCategoryChange(index, value);
                  }}
                />
                <FormSelect
                  form={form}
                  name={`rawMaterialsUsed.${index}.type`}
                  label="Type"
                  placeholder="Select type"
                  options={filteredTypes[index] || []}
                  required
                  disabled={
                    isSubmitting ||
                    !form.watch(`rawMaterialsUsed.${index}.category`)
                  }
                  onValueChange={(value) => {
                    form.setValue(`rawMaterialsUsed.${index}.type`, value);
                    handleTypeChange(index, value);
                  }}
                />
                <FormInput
                  form={form}
                  name={`rawMaterialsUsed.${index}.unit`}
                  label="Unit"
                  placeholder="Unit will be set automatically"
                  required
                  disabled={true}
                />
                <FormInput
                  form={form}
                  name={`rawMaterialsUsed.${index}.quantity`}
                  label="Quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter quantity"
                  required
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </Form>
  );
}
