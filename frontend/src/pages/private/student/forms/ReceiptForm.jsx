import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import ImageUpload from "@/components/custom-components/ImageUpload";
import FormDateInput from "@/components/custom-components/FormDateInput";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { validateReceipt } from "@/lib/ocr";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

export function ReceiptForm({ order, onSubmit, isSubmitting = false, onValidationStateChange = () => {} }) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null | 'valid' | 'invalid'

  // Notify parent component of validation state changes
  useEffect(() => {
    onValidationStateChange?.(isValidating);
  }, [isValidating, onValidationStateChange]);

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
  
  // Watch for changes in receipt image and OR number
  const receiptImage = form.watch("image");
  const orNumber = form.watch("orNumber");

  useEffect(() => {
    if (paymentType === "Full Payment") {
      form.setValue("amount", remainingBalance);
    }
  }, [paymentType, remainingBalance, form]);

  // Validate receipt when both image and OR number are provided
  useEffect(() => {
    const validateReceiptData = async () => {
      // Skip validation if already validated successfully and image hasn't changed
      if (validationStatus === 'valid' && !receiptImage?.data) {
        return;
      }

      if (receiptImage?.data && orNumber && !isValidating) {
        setIsValidating(true);
        setValidationStatus(null);
        try {
          const result = await validateReceipt(receiptImage.data, orNumber);
          if (!result.isValid) {
            form.setError("orNumber", {
              type: "manual",
              message: "OR number not found in receipt image"
            });
            toast.error("Invalid receipt. Please check that:\n- The OR number matches the receipt\n- The uploaded image is a valid receipt\n- The receipt image is clear and readable");
            setValidationStatus('invalid');
            // Clear the image when validation fails
            form.setValue("image", null);
          } else {
            form.clearErrors("orNumber");
            toast.success("Receipt validated successfully!");
            setValidationStatus('valid');
          }
        } catch (error) {
          console.error("Receipt validation error:", error);
          toast.error("Failed to validate receipt. Please ensure the image is clear and try again.");
          setValidationStatus('invalid');
          // Clear the image when validation fails
          form.setValue("image", null);
        } finally {
          setIsValidating(false);
        }
      }
    };

    validateReceiptData();
  }, [receiptImage, orNumber]);

  // Reset validation status when OR number changes
  useEffect(() => {
    if (validationStatus === 'valid' && !receiptImage?.data) {
      setValidationStatus(null);
    }
  }, [orNumber, receiptImage]);

  const paymentTypes = [
    { value: "Partial Payment", label: "Partial Payment" },
    { value: "Full Payment", label: "Full Payment" },
  ];

  const handleFormSubmit = async (data) => {
    // Only validate if not already validated successfully
    if (receiptImage?.data && orNumber && validationStatus !== 'valid') {
      try {
        const result = await validateReceipt(receiptImage.data, orNumber);
        if (!result.isValid) {
          toast.error("Invalid receipt. Please check that:\n- The OR number matches the receipt\n- The uploaded image is a valid receipt\n- The receipt image is clear and readable");
          return;
        }
      } catch (error) {
        console.error("Receipt validation error:", error);
        toast.error("Failed to validate receipt. Please ensure the image is clear and try again.");
        return;
      }
    }
    // Proceed with form submission
    onSubmit({ receipt: data });
  };

  return (
    <Form {...form}>
      <form
        id="receiptForm"
        onSubmit={form.handleSubmit(handleFormSubmit)}
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
              disabled={isSubmitting || isValidating}
            />

            <FormInput
              form={form}
              name="orNumber"
              label="OR Number"
              placeholder="Enter OR Number"
              icon={Receipt}
              required
              disabled={isSubmitting || isValidating}
            />

            <FormDateInput
              form={form}
              name="datePaid"
              label="Date Paid"
              required
              disabled={isSubmitting || isValidating}
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
              disabled={isSubmitting || isValidating || paymentType === "Full Payment"}
              description={
                paymentType === "Full Payment"
                  ? "Amount is set to remaining balance for full payment"
                  : `Remaining balance: ₱${remainingBalance.toFixed(2)}`
              }
            />

            <div className="space-y-2">
              <ImageUpload
                form={form}
                name="image"
                label="Receipt Image"
                required={true}
                disabled={isSubmitting || isValidating}
              />
              
              {(isValidating || validationStatus) && (
                <div className="flex items-center justify-center mt-2">
                  {isValidating ? (
                    <Badge variant="outline" className="flex items-center gap-2 text-center whitespace-normal break-words px-3 py-1">
                      <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                      <span>Validating Receipt...</span>
                    </Badge>
                  ) : validationStatus === 'valid' ? (
                    <Badge variant="success" className="bg-green-500/15 text-green-600 border-green-200 text-center whitespace-normal break-words px-3 py-1">
                      Receipt Validated Successfully
                    </Badge>
                  ) : validationStatus === 'invalid' ? (
                    <Badge variant="destructive" className="bg-red-500/15 text-red-600 border-red-200 text-center whitespace-normal break-words px-3 py-1">
                      Invalid Receipt - Please Check OR Number
                    </Badge>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default ReceiptForm;
