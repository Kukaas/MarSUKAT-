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

export function ReceiptForm({ 
  order, 
  onSubmit, 
  isSubmitting = false, 
  onValidationStateChange = () => {},
  existingReceipt = null,
  isEditing = false
}) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null | 'valid' | 'invalid'
  // Track validated values to prevent re-validation
  const [validatedValues, setValidatedValues] = useState({
    orNumber: existingReceipt?.orNumber || "",
    imageData: existingReceipt?.image?.data || null
  });

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

    // If editing, add back the existing receipt amount to available balance
    const adjustedPaidAmount = isEditing && existingReceipt
      ? totalPaidAmount - existingReceipt.amount
      : totalPaidAmount;

    return Math.max(0, totalOrderAmount - adjustedPaidAmount);
  };

  const remainingBalance = calculateRemainingBalance();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: existingReceipt?.type || "Full Payment",
      orNumber: existingReceipt?.orNumber || "",
      datePaid: existingReceipt?.datePaid 
        ? new Date(existingReceipt.datePaid).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      amount: existingReceipt?.amount || remainingBalance,
      image: existingReceipt?.image || null,
    },
  });

  const paymentType = form.watch("type");
  
  // Watch for changes in receipt image and OR number
  const receiptImage = form.watch("image");
  const orNumber = form.watch("orNumber");

  // Set amount to remaining balance for Full Payment (unless editing)
  useEffect(() => {
    if (paymentType === "Full Payment" && !isEditing) {
      form.setValue("amount", remainingBalance);
    }
  }, [paymentType, remainingBalance, form, isEditing]);

  // Improved validation logic - fix validation loop for both add and edit modes
  useEffect(() => {
    const validateReceiptData = async () => {
      // Skip if we've already validated these exact values
      if (orNumber === validatedValues.orNumber && 
          receiptImage?.data === validatedValues.imageData) {
        return;
      }

      // Skip validation if already successfully validated
      if (validationStatus === 'valid') {
        return;
      }

      // Only proceed if we have both image and OR number, and not currently validating
      if (receiptImage?.data && orNumber && orNumber.trim() !== '' && !isValidating) {
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
          } else {
            form.clearErrors("orNumber");
            toast.success("Receipt validated successfully!");
            setValidationStatus('valid');
            
            // Save the validated values to prevent revalidation
            setValidatedValues({
              orNumber: orNumber,
              imageData: receiptImage.data
            });
          }
        } catch (error) {
          console.error("Receipt validation error:", error);
          toast.error("Failed to validate receipt. Please ensure the image is clear and try again.");
          setValidationStatus('invalid');
        } finally {
          setIsValidating(false);
        }
      }
    };

    validateReceiptData();
  }, [receiptImage?.data, orNumber, form, isValidating, validationStatus]);

  // Reset validation status when values change from their validated state
  useEffect(() => {
    if (!validationStatus) return;
    
    const hasOrNumberChanged = orNumber !== validatedValues.orNumber;
    const hasImageChanged = receiptImage?.data !== validatedValues.imageData;
    
    if (hasOrNumberChanged || hasImageChanged) {
      setValidationStatus(null);
    }
  }, [orNumber, receiptImage?.data, validationStatus, validatedValues]);

  const paymentTypes = [
    { value: "Partial Payment", label: "Partial Payment" },
    { value: "Full Payment", label: "Full Payment" },
  ];

  const handleFormSubmit = async (data) => {
    // Skip validation if we've already validated these exact values
    const skipValidation = orNumber === validatedValues.orNumber && 
                          receiptImage?.data === validatedValues.imageData;

    // Only validate if not already validated successfully and not skipping validation
    if (!skipValidation && receiptImage?.data && orNumber && validationStatus !== 'valid') {
      setIsValidating(true);
      try {
        const result = await validateReceipt(receiptImage.data, orNumber);
        if (!result.isValid) {
          toast.error("Invalid receipt. Please check that:\n- The OR number matches the receipt\n- The uploaded image is a valid receipt\n- The receipt image is clear and readable");
          setIsValidating(false);
          return;
        }
        setValidationStatus('valid');
        // Save the validated values
        setValidatedValues({
          orNumber: orNumber,
          imageData: receiptImage.data
        });
      } catch (error) {
        console.error("Receipt validation error:", error);
        toast.error("Failed to validate receipt. Please ensure the image is clear and try again.");
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
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
                {isEditing ? "Available Balance:" : "Remaining Balance:"}
              </p>
              <p className="text-lg font-semibold text-primary">
                ₱{remainingBalance.toFixed(2)}
                {isEditing && existingReceipt && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (includes current receipt amount of ₱{existingReceipt.amount.toFixed(2)})
                  </span>
                )}
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
              disabled={isSubmitting || isValidating || (paymentType === "Full Payment" && !isEditing)}
              description={
                paymentType === "Full Payment" && !isEditing
                  ? "Amount is set to remaining balance for full payment"
                  : `Available balance: ₱${remainingBalance.toFixed(2)}`
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
