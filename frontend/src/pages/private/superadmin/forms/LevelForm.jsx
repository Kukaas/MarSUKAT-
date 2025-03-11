import FormInput from "@/components/custom-components/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  level: z.string().min(1, "Level name is required"),
  description: z.string().min(1, "Description is required"),
});

export function LevelForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: formData?.level || "",
      description: formData?.description || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (formData) {
      form.reset({
        level: formData.level || "",
        description: formData.description || "",
      });
    }
  }, [formData, form]);

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
        id="levelForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {isEdit && formData?.levelId && (
          <FormInput
            form={form}
            name="levelId"
            label="Level ID"
            value={formData.levelId}
            disabled
          />
        )}
        <FormInput
          form={form}
          name="level"
          label="Level"
          placeholder="Enter level (e.g., College, Senior High School)"
          required
          disabled={isSubmitting}
        />
        <FormInput
          form={form}
          name="description"
          label="Description"
          placeholder="Enter level description"
          required
          disabled={isSubmitting}
        />
      </form>
    </Form>
  );
}
