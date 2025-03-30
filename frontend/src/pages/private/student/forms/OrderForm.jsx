import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import ImageUpload from "@/components/custom-components/ImageUpload";
import FormDateInput from "@/components/custom-components/FormDateInput";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt, User, Mail, School, Building2, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { validateReceipt } from "@/lib/ocr";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  studentNumber: z.string().min(1, "Student number is required"),
  level: z.string().min(1, "Level is required"),
  department: z.string().min(1, "Department is required"),
  gender: z.enum(["Male", "Female"]),
  receipt: z.object({
    type: z.enum(["Down Payment", "Partial Payment", "Full Payment"]),
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
  }),
});

export function OrderForm({
  formData,
  onSubmit,
  isSubmitting = false,
  isEditing = false,
  onValidationStateChange = () => {},
}) {
  const { user } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null | 'valid' | 'invalid'

  // Notify parent component of validation state changes
  useEffect(() => {
    onValidationStateChange(isValidating);
  }, [isValidating, onValidationStateChange]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: formData?.userId || user?._id || "",
      name: formData?.name || user?.name || "",
      email: formData?.email || user?.email || "",
      studentNumber: formData?.studentNumber || user?.studentNumber || "",
      level: formData?.level || user?.level || "",
      department: formData?.department || user?.department || "",
      gender: formData?.gender || user?.gender || user?.studentGender || "",
      receipt: {
        type: formData?.receipts?.[0]?.type || "Down Payment",
        orNumber: formData?.receipts?.[0]?.orNumber || "",
        datePaid: formData?.receipts?.[0]?.datePaid 
          ? new Date(formData.receipts[0].datePaid).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        amount: formData?.receipts?.[0]?.amount || 500,
        image: formData?.receipts?.[0]?.image || null,
      },
    },
  });

  // Watch for changes in receipt image and OR number
  const receiptImage = form.watch("receipt.image");
  const orNumber = form.watch("receipt.orNumber");

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
            form.setError("receipt.orNumber", {
              type: "manual",
              message: "OR number not found in receipt image"
            });
            toast.error("Invalid receipt. Please check that:\n- The OR number matches the receipt\n- The uploaded image is a valid receipt\n- The receipt image is clear and readable");
            setValidationStatus('invalid');
            // Clear the image when validation fails
            form.setValue("receipt.image", null);
          } else {
            form.clearErrors("receipt.orNumber");
            toast.success("Receipt validated successfully!");
            setValidationStatus('valid');
          }
        } catch (error) {
          console.error("Receipt validation error:", error);
          toast.error("Failed to validate receipt. Please ensure the image is clear and try again.");
          setValidationStatus('invalid');
          // Clear the image when validation fails
          form.setValue("receipt.image", null);
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

  // Modify the original handleSubmit to include validation
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
    onSubmit(data);
  };

  useEffect(() => {
    if (user && !formData) {
      form.reset({
        userId: user._id,
        name: user.name || "",
        email: user.email || "",
        studentNumber: user.studentNumber || "",
        level: user.level || "",
        department: user.department || "",
        gender: user.gender || user.studentGender || "",
        receipt: {
          type: "Down Payment",
          orNumber: "",
          datePaid: new Date().toISOString().split("T")[0],
          amount: 500,
          image: null,
        },
      });
    }
  }, [user, form, formData]);

  // Expose validation state to parent component
  useEffect(() => {
    if (form.formState.isSubmitButton) {
      form.formState.isSubmitButton.disabled = isValidating;
    }
  }, [isValidating, form.formState]);

  const paymentTypes = [
    { value: "Down Payment", label: "Down Payment" },
    { value: "Partial Payment", label: "Partial Payment" },
    { value: "Full Payment", label: "Full Payment" },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  return (
    <Form {...form}>
      <form
        id="orderForm"
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="space-y-4">
          {/* Personal Information - All disabled */}
          <div className="grid gap-4">
            <FormInput
              form={form}
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              icon={User}
              required
              disabled={true}
            />

            <FormInput
              form={form}
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={Mail}
              required
              disabled={true}
            />

            <FormInput
              form={form}
              name="studentNumber"
              label="Student Number"
              placeholder="Enter your student number"
              icon={School}
              required
              disabled={true}
            />

            <FormInput
              form={form}
              name="level"
              label="Level"
              placeholder="Enter your level"
              icon={Building2}
              required
              disabled={true}
            />

            <FormInput
              form={form}
              name="department"
              label="Department"
              placeholder="Enter your department"
              icon={Building2}
              required
              disabled={true}
            />

            <FormInput
              form={form}
              name="gender"
              label="Gender"
              placeholder="Enter your gender"
              icon={Users}
              required
              disabled={true}
            />
          </div>

          {/* Payment Information - Only date paid and receipt image are enabled */}
          <div className="space-y-4 border rounded-lg p-4 bg-background/50">
            <h3 className="font-medium">Payment Details</h3>
            <div className="grid gap-4">
              <FormInput
                form={form}
                name="receipt.type"
                label="Payment Type"
                placeholder="Enter payment type"
                icon={Receipt}
                required
                disabled={true}
              />

              <FormInput
                form={form}
                name="receipt.orNumber"
                label="OR Number"
                placeholder="Enter OR Number"
                icon={Receipt}
                required
                disabled={isSubmitting || isValidating}
              />

              {/* Date Paid - Enabled */}
              <FormDateInput
                form={form}
                name="receipt.datePaid"
                label="Date Paid"
                required
                disabled={isSubmitting || isValidating}
                disableFutureDates={true}
              />

              <FormInput
                form={form}
                name="receipt.amount"
                label="Amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                icon={Receipt}
                required
                disabled={true}
              />

              {/* Receipt Image Upload - Enabled */}
              <div className="space-y-2">
                <ImageUpload
                  form={form}
                  name="receipt.image"
                  label="Receipt Image"
                  required={!isEditing}
                  disabled={isSubmitting || isValidating}
                  defaultImage={formData?.receipt?.image}
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
        </div>
      </form>
    </Form>
  );
}

export default OrderForm;
