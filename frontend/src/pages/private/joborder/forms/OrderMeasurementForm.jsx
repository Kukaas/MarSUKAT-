import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shirt, Ruler, Scale } from "lucide-react";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDataFetching } from "@/hooks/useDataFetching";

const formSchema = z.object({
  orderItems: z
    .array(
      z.object({
        level: z.string().min(1, "Level is required"),
        productType: z.string().min(1, "Product type is required"),
        size: z.string().min(1, "Size is required"),
        quantity: z.coerce
          .number()
          .int("Quantity must be a whole number")
          .positive("Quantity must be positive"),
        unitPrice: z.coerce
          .number()
          .positive("Unit price must be positive")
          .transform((v) => parseFloat(v.toFixed(2))),
      })
    )
    .min(1, "At least one item is required"),
});

export function OrderMeasurementForm({
  onSubmit,
  isSubmitting = false,
  studentLevel,
}) {
  const [filteredOptions, setFilteredOptions] = useState({
    productTypes: [],
    sizes: [],
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([{ id: Date.now() }]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderItems: [
        {
          level: studentLevel,
          quantity: "",
          unitPrice: 0,
          productType: "",
          size: "",
        },
      ],
    },
    mode: "onTouched",
  });

  // Fetch product types with React Query
  const { data: productTypes = [], isLoading: isLoadingProducts } = useDataFetching(
    ['productTypes', studentLevel],
    async () => {
      const data = await systemMaintenanceAPI.getAllProductTypes();
      // Filter product types for student level
      const levelProducts = data.filter(
        (item) => item.level === studentLevel
      );
      const uniqueProductTypes = [
        ...new Set(levelProducts.map((item) => item.productType)),
      ];

      setFilteredOptions({
        productTypes: uniqueProductTypes.map((type) => ({
          value: type,
          label: type,
        })),
        sizes: [],
      });

      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  // Get size options
  const getSizeOptions = (productType) => {
    if (!productType || !productTypes.length) return [];

    const matchingProducts = productTypes.filter(
      (item) => item.level === studentLevel && item.productType === productType
    );

    return matchingProducts.map((item) => ({
      value: item.size,
      label: item.size,
    }));
  };

  // Add order item
  const addOrderItem = () => {
    const newIndex = orderItems.length;
    setOrderItems([...orderItems, { id: Date.now() }]);

    const currentItems = form.getValues("orderItems");
    form.setValue("orderItems", [ 
      ...currentItems,
      {
        level: studentLevel,
        quantity: "",
        unitPrice: 0,
        productType: "",
        size: "",
      },
    ]);
  };

  // Remove order item
  const removeOrderItem = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
    const currentItems = form.getValues("orderItems");
    currentItems.splice(index, 1);
    form.setValue("orderItems", currentItems);
  };

  const handleFormSubmit = async (data) => {
    const formattedData = {
      orderItems: data.orderItems.map((item) => ({
        level: studentLevel,
        productType: item.productType,
        size: item.size,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
    };

    await onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="space-y-4">
          {orderItems.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {orderItems.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="hidden"
                    {...form.register(`orderItems.${index}.level`)}
                    value={studentLevel}
                  />

                  <FormSelect
                    form={form}
                    name={`orderItems.${index}.productType`}
                    label="Product Type"
                    placeholder="Product Type"
                    options={filteredOptions.productTypes}
                    icon={Shirt}
                    required
                    disabled={isSubmitting || isLoadingProducts}
                    onChange={(value) => {
                      form.setValue(`orderItems.${index}.size`, "");
                      form.setValue(`orderItems.${index}.unitPrice`, 0);

                      const newSelectedProducts = [...selectedProducts];
                      newSelectedProducts[index] = null;
                      setSelectedProducts(newSelectedProducts);
                    }}
                  />

                  <FormSelect
                    form={form}
                    name={`orderItems.${index}.size`}
                    label="Size"
                    placeholder="Size"
                    options={getSizeOptions(
                      form.watch(`orderItems.${index}.productType`)
                    )}
                    icon={Ruler}
                    required
                    disabled={
                      isSubmitting ||
                      isLoadingProducts ||
                      !form.watch(`orderItems.${index}.productType`)
                    }
                    onValueChange={(value) => {
                      const productType = form.watch(
                        `orderItems.${index}.productType`
                      );

                      if (value && productType) {
                        const matchingProduct = productTypes.find(
                          (item) =>
                            item.level === studentLevel &&
                            item.productType === productType &&
                            item.size === value
                        );

                        if (matchingProduct) {
                          const newSelectedProducts = [...selectedProducts];
                          newSelectedProducts[index] = matchingProduct;
                          setSelectedProducts(newSelectedProducts);

                          form.setValue(`orderItems.${index}.size`, value);
                          form.setValue(
                            `orderItems.${index}.unitPrice`,
                            matchingProduct.price
                          );
                        }
                      }
                    }}
                  />

                  <FormInput
                    form={form}
                    name={`orderItems.${index}.quantity`}
                    label="Quantity"
                    type="number"
                    placeholder="Enter quantity"
                    icon={Scale}
                    required
                    disabled={isSubmitting}
                  />

                  <FormInput
                    form={form}
                    name={`orderItems.${index}.unitPrice`}
                    label="Unit Price (₱)"
                    type="number"
                    step="0.01"
                    disabled={true}
                  />

                  {selectedProducts[index]?.price && (
                    <div className="col-span-2 bg-muted p-3 rounded-lg space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Unit Price:
                        </span>
                        <span className="font-medium">
                          ₱{selectedProducts[index].price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">
                          {form.watch(`orderItems.${index}.quantity`) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-semibold border-t border-border/50 pt-1 mt-1">
                        <span>Total:</span>
                        <span className="text-primary">
                          ₱
                          {(
                            selectedProducts[index].price *
                            (form.watch(`orderItems.${index}.quantity`) || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addOrderItem}
            disabled={isSubmitting}
          >
            Add Another Item
          </Button>
        </div>

        {orderItems.length > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-base font-semibold">
                <span>Overall Total:</span>
                <span className="text-primary text-lg">
                  ₱
                  {orderItems
                    .reduce((total, _, index) => {
                      const price = selectedProducts[index]?.price || 0;
                      const quantity =
                        form.watch(`orderItems.${index}.quantity`) || 0;
                      return total + price * quantity;
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || isLoadingProducts}>
            {isSubmitting ? "Saving Measurements..." : "Save Measurements"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
