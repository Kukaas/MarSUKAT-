import FormInput from "@/components/custom-components/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  price: z
    .string()
    .min(1, "Price is required")
    .refine((value) => {
      // Accept either whole numbers or numbers with exactly 2 decimal places
      return /^\d+$/.test(value) || /^\d+\.\d{2}$/.test(value);
    }, "Price must be a whole number or have exactly 2 decimal places (e.g., ₱10 or ₱10.50)"),
});

export function PriceForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price:
        typeof formData?.price === "number" ? formData.price.toFixed(2) : "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        price:
          typeof formData.price === "number" ? formData.price.toFixed(2) : "",
      });
    }
  }, [formData, form]);

  const handleSubmit = async (data) => {
    try {
      // Convert string price to number and ensure 2 decimal places
      let priceValue = data.price;
      // If it's a whole number, add .00
      if (/^\d+$/.test(priceValue)) {
        priceValue = `${priceValue}.00`;
      }

      const formattedData = {
        ...data,
        price: Number(priceValue),
      };
      await onSubmit(formattedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Handle blur event to format the input
  const handleBlur = (event) => {
    const value = event.target.value;
    if (value && /^\d+$/.test(value)) {
      form.setValue("price", `${value}.00`, { shouldValidate: true });
    }
  };

  return (
    <Form {...form}>
      <form
        id="priceForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {isEdit && formData?.priceId && (
          <FormInput
            form={form}
            name="priceId"
            label="Price ID"
            value={formData.priceId}
            disabled
          />
        )}
        <FormInput
          form={form}
          name="price"
          label="Price (₱)"
          placeholder="Enter price (e.g., 10 or 10.50)"
          required
          disabled={isSubmitting}
          type="number"
          step="any"
          min="0"
          onBlur={handleBlur}
        />
      </form>
    </Form>
  );
}
