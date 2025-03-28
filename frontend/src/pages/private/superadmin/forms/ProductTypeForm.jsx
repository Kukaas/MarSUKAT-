import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  GraduationCap,
  Box,
  Tag,
  Ruler,
  DollarSign,
} from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";

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

const formSchema = z.object({
  level: z.string().min(1, "Level is required"),
  productType: z.string().min(1, "Product type is required"),
  size: z.string().min(1, "Size is required"),
  price: z.coerce
    .number()
    .min(0.01, "Price must be greater than 0")
    .refine((val) => /^\d+\.\d{2}$/.test(val.toFixed(2)), {
      message: "Price must have exactly 2 decimal places",
    }),
  rawMaterialsUsed: z.array(
    z.object({
      category: z.string().min(1, "Category is required"),
      type: z.string().min(1, "Type is required"),
      quantity: z.coerce
        .number()
        .min(0.01, "Quantity must be greater than 0")
        .refine((val) => /^\d+\.\d{2}$/.test(val.toFixed(2)), {
          message: "Quantity must have exactly 2 decimal places",
        }),
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
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [rawMaterialTypes, setRawMaterialTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState({});
  const [prices, setPrices] = useState([]);

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
        const [levelsData, sizesData, typesData, unitsData, pricesData] =
          await Promise.all([
            systemMaintenanceAPI.getAllLevels(),
            systemMaintenanceAPI.getAllSizes(),
            systemMaintenanceAPI.getAllRawMaterialTypes(),
            systemMaintenanceAPI.getAllUnits(),
            systemMaintenanceAPI.getAllPrices(),
          ]);

        // Sort levels alphabetically
        setLevels(sortOptionsAlphabetically(levelsData, "level"));

        // Sort sizes alphabetically
        setSizes(sortOptionsAlphabetically(sizesData, "size"));

        // Sort prices numerically
        setPrices(
          pricesData
            .map((p) => ({
              value: p.price.toFixed(2),
              label: `₱${p.price.toFixed(2)}`,
            }))
            .sort((a, b) => parseFloat(a.value) - parseFloat(b.value))
        );

        // Store raw material types (sorted alphabetically)
        setRawMaterialTypes(
          [...typesData].sort((a, b) =>
            a.name
              .trim()
              .localeCompare(b.name.trim(), "en", { sensitivity: "base" })
          )
        );

        // Get unique categories and sort alphabetically
        const uniqueCategories = [...new Set(typesData.map((t) => t.category))]
          .sort((a, b) =>
            a.trim().localeCompare(b.trim(), "en", { sensitivity: "base" })
          )
          .map((c) => ({
            value: c,
            label: c,
          }));
        setCategories(uniqueCategories);

        // Sort units alphabetically
        setUnits(sortOptionsAlphabetically(unitsData, "unit"));
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (formData) {
      // First reset the form with the data
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

      // Then set up filtered types for each material
      if (formData.rawMaterialsUsed && rawMaterialTypes.length > 0) {
        formData.rawMaterialsUsed.forEach((material, index) => {
          if (material.category) {
            // Filter and sort types for the selected category
            const typesForCategory = rawMaterialTypes
              .filter((type) => type.category === material.category)
              .sort((a, b) =>
                a.name.trim().localeCompare(b.name.trim(), "en", { sensitivity: "base" })
              )
              .map((type) => ({
                value: type.name,
                label: type.name.trim(),
                unit: type.unit,
              }));

            // Update filtered types for this index
            setFilteredTypes((prev) => ({
              ...prev,
              [index]: typesForCategory,
            }));
          }
        });
      }
    }
  }, [formData, form, rawMaterialTypes]);

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
      // Format price and quantities with 2 decimal places
      const formattedData = {
        ...data,
        price: parseFloat(data.price).toFixed(2),
        rawMaterialsUsed: data.rawMaterialsUsed.map((material) => ({
          ...material,
          quantity: parseFloat(material.quantity).toFixed(2),
        })),
      };
      await onSubmit(formattedData);
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
            icon={GraduationCap}
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
            icon={Box}
            required
            disabled={isSubmitting}
          />
          <FormSelect
            form={form}
            name="price"
            label="Price"
            placeholder="Select price"
            options={prices}
            icon={DollarSign}
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
                  icon={Tag}
                  required
                  disabled={isSubmitting}
                  onValueChange={(value) => {
                    form.setValue(`rawMaterialsUsed.${index}.type`, "");
                    form.setValue(`rawMaterialsUsed.${index}.unit`, "");
                    form.setValue(`rawMaterialsUsed.${index}.category`, value);
                  }}
                />
                <FormSelect
                  form={form}
                  name={`rawMaterialsUsed.${index}.type`}
                  label="Type"
                  placeholder="Select type"
                  options={filteredTypes[index] || []}
                  icon={Box}
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
