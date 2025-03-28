import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import ImageUpload from "@/components/custom-components/ImageUpload";
import FormDateInput from "@/components/custom-components/FormDateInput";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt, User, Mail, School, Building2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

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
}) {
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: formData?.userId || user?._id || "",
      name: formData?.name || user?.name || "",
      email: formData?.email || user?.email || "",
      studentNumber: formData?.studentNumber || user?.studentNumber || "",
      level: formData?.level || user?.level || "",
      department: formData?.department || user?.department || "",
      gender: formData?.gender || user?.gender || "Male",
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

  useEffect(() => {
    if (user && !formData) {
      form.reset({
        userId: user._id,
        name: user.name || "",
        email: user.email || "",
        studentNumber: user.studentNumber || "",
        level: user.level || "",
        department: user.department || "",
        gender: user.gender || "Male",
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
        onSubmit={form.handleSubmit(onSubmit)}
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
                disabled={isSubmitting}
              />

              {/* Date Paid - Enabled */}
              <FormDateInput
                form={form}
                name="receipt.datePaid"
                label="Date Paid"
                required
                disabled={isSubmitting}
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
              <ImageUpload
                form={form}
                name="receipt.image"
                label="Receipt Image"
                required={!isEditing}
                disabled={isSubmitting}
                defaultImage={formData?.receipt?.image}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default OrderForm;
