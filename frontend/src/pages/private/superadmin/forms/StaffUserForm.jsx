import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Create two different schemas for create and edit modes
const createFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(1, "Position is required"),
  role: z.enum(["JobOrder", "BAO"], {
    required_error: "Role is required",
  }),
  gender: z.string().min(1, "Gender is required"),
});

const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(1, "Position is required"),
  gender: z.string().min(1, "Gender is required"),
});

const roleOptions = [
  { value: "JobOrder", label: "Job Order" },
  { value: "BAO", label: "BAO" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export function StaffUserForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(isEdit ? editFormSchema : createFormSchema),
    defaultValues: {
      name: formData?.name || "",
      email: formData?.email || "",
      position: formData?.position || "",
      role: formData?.role || "",
      gender: formData?.gender || genderOptions[0].value,
    },
    mode: "onTouched",
  });

  const handleSubmit = async (data) => {
    try {
      // Ensure role is included in the data for create mode
      if (!isEdit && !data.role) {
        data.role = formData.role;
      }
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        id="staffUserForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {/* Personal Information Section */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <Separator className="my-2" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    form={form}
                    name="name"
                    label="Name"
                    placeholder="Enter full name"
                    required
                    disabled={isSubmitting}
                  />
                  <FormInput
                    form={form}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    required
                    disabled={isSubmitting}
                  />
                  <FormSelect
                    form={form}
                    name="gender"
                    label="Gender"
                    placeholder="Select gender"
                    options={genderOptions}
                    required
                    disabled={isSubmitting}
                  />
                  {!isEdit && (
                    <FormSelect
                      form={form}
                      name="role"
                      label="Role"
                      placeholder="Select role"
                      options={roleOptions}
                      required
                      disabled={isSubmitting}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Information Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Position Information</h3>
                <Separator className="my-2" />
                <div className="grid gap-4">
                  <FormInput
                    form={form}
                    name="position"
                    label="Position"
                    placeholder="Enter staff position"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
} 