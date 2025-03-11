import FormInput from "@/components/custom-components/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  level: z.string().min(1, "Level is required"),
  description: z.string().min(1, "Description is required"),
});

export function LevelForm({ formData, setFormData, isEdit = false, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: formData || {
      level: "",
      description: "",
    },
  });

  // Update form when formData changes (for edit mode)
  useEffect(() => {
    if (formData) {
      form.reset(formData);
    }
  }, [formData, form]);

  // Handle form changes
  const handleFormChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Form {...form}>
      <form
        id="levelForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormInput
          form={form}
          name="level"
          label="Level"
          placeholder="Enter level (e.g., College, Senior High School)"
          required
          onChange={(e) => handleFormChange("level", e.target.value)}
        />
        <FormInput
          form={form}
          name="description"
          label="Description"
          placeholder="Enter level description"
          required
          onChange={(e) => handleFormChange("description", e.target.value)}
        />
      </form>
    </Form>
  );
}
