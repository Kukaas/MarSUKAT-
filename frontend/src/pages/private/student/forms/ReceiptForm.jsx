import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import ImageUpload from "@/components/custom-components/ImageUpload";
import FormDateInput from "@/components/custom-components/FormDateInput";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  type: z.enum(["Partial Payment", "Full Payment"]),
  orNumber: z.string().min(1, "OR Number is required"),
  datePaid: z.string().min(1, "Date paid is required"),
  image: z
    .object({
      filename: z.string(),
      contentType: z.string(),
      data: z.string(),
    })
    .refine((val) => !!val, {
      message: "Receipt image is required",
    }),
  amount: z.coerce
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .nonnegative("Amount cannot be negative"),
});

export function ReceiptForm({ order, onSubmit, isSubmitting = false }) {
  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    if (!order?.orderItems) return 0;

    const totalOrderAmount = order.orderItems.reduce(
      (total, item) => total + (item.unitPrice || 0) * (item.quantity || 0),
      0
    );

    const totalPaidAmount =
      order.receipts?.reduce(
        (total, receipt) => total + (receipt.amount || 0),
        0
      ) || 0;

    return Math.max(0, totalOrderAmount - totalPaidAmount);
  };

  const remainingBalance = calculateRemainingBalance();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Full Payment",
      orNumber: "",
      datePaid: new Date().toISOString().split("T")[0],
      amount: remainingBalance,
      image: null,
    },
  });

  const paymentType = form.watch("type");

  useEffect(() => {
    if (paymentType === "Full Payment") {
      form.setValue("amount", remainingBalance);
    }
  }, [paymentType, remainingBalance, form]);

  const paymentTypes = [
    { value: "Partial Payment", label: "Partial Payment" },
    { value: "Full Payment", label: "Full Payment" },
  ];

  const handleSubmit = (data) => {
    onSubmit({ receipt: data });
  };

  return (
    <Form {...form}>
      <form
        id="receiptForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="space-y-4">
          {remainingBalance > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">
                Remaining Balance:
              </p>
              <p className="text-lg font-semibold text-primary">
                ₱{remainingBalance.toFixed(2)}
              </p>
            </div>
          )}

          <div className="grid gap-4">
            <FormSelect
              form={form}
              name="type"
              label="Payment Type"
              options={paymentTypes}
              icon={Receipt}
              required
              disabled={isSubmitting}
            />

            <FormInput
              form={form}
              name="orNumber"
              label="OR Number"
              placeholder="Enter OR Number"
              icon={Receipt}
              required
              disabled={isSubmitting}
            />

            <FormDateInput
              form={form}
              name="datePaid"
              label="Date Paid"
              required
              disabled={isSubmitting}
              disableFutureDates={true}
            />

            <FormInput
              form={form}
              name="amount"
              label="Amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              icon={Receipt}
              required
              disabled={isSubmitting || paymentType === "Full Payment"}
              description={
                paymentType === "Full Payment"
                  ? "Amount is set to remaining balance for full payment"
                  : `Remaining balance: ₱${remainingBalance.toFixed(2)}`
              }
            />

            <ImageUpload
              form={form}
              name="image"
              label="Receipt Image"
              required={true}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}

export default ReceiptForm;
