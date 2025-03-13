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
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.string().min(1, "Gender is required"),
  jobType: z.string().min(1, "Job type is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  jobType: z.string().min(1, "Job type is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const jobTypeOptions = [
  { value: "Carpenter", label: "Carpenter" },
  { value: "Electrician", label: "Electrician" },
  { value: "Plumber", label: "Plumber" },
  { value: "Painter", label: "Painter" },
  { value: "Mason", label: "Mason" },
  { value: "HVAC Technician", label: "HVAC Technician" },
  { value: "General Maintenance", label: "General Maintenance" },
];

export function JobOrderForm({
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
      password: "",
      gender: formData?.gender || "",
      jobType: formData?.jobType || "",
      jobDescription: formData?.jobDescription || "",
    },
    mode: "onTouched",
  });

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        id="jobOrderForm"
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
                  {!isEdit && (
                    <FormInput
                      form={form}
                      name="password"
                      label="Password"
                      type="password"
                      placeholder="Enter password"
                      required
                      disabled={isSubmitting}
                    />
                  )}
                  <FormSelect
                    form={form}
                    name="gender"
                    label="Gender"
                    placeholder="Select gender"
                    options={genderOptions}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Information</h3>
                <Separator className="my-2" />
                <div className="grid gap-4">
                  <FormSelect
                    form={form}
                    name="jobType"
                    label="Job Type"
                    placeholder="Select job type"
                    options={jobTypeOptions}
                    required
                    disabled={isSubmitting}
                  />
                  <FormInput
                    form={form}
                    name="jobDescription"
                    label="Job Description"
                    placeholder="Enter detailed job description"
                    required
                    disabled={isSubmitting}
                    isTextarea
                    rows={4}
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
