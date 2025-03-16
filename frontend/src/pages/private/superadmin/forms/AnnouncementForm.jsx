import FormInput from "@/components/custom-components/FormInput";
import FormDateInput from "@/components/custom-components/FormDateInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Calendar, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  priority: z.string().min(1, "Priority is required"),
});

const priorityOptions = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
];

export function AnnouncementForm({
  formData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formData?.title || "",
      content: formData?.content || "",
      startDate: formData?.startDate || "",
      endDate: formData?.endDate || "",
      priority: formData?.priority || "low",
    },
    mode: "onChange",
  });

  // Update form when formData changes
  useEffect(() => {
    if (formData) {
      form.reset(formData);
    }
  }, [formData, form.reset]);

  return (
    <Form {...form}>
      <form
        id="announcementForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6">
          <FormInput
            form={form}
            name="title"
            label="Title"
            placeholder="Enter announcement title"
            icon={MessageSquare}
            required
            disabled={isSubmitting}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <Textarea
                  {...field}
                  placeholder="Enter announcement content"
                  className="min-h-[100px]"
                  disabled={isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormDateInput
              form={form}
              name="startDate"
              label="Start Date"
              placeholder="Select start date"
              icon={Calendar}
              required
              disabled={isSubmitting}
              disableFutureDates={false}
            />

            <FormDateInput
              form={form}
              name="endDate"
              label="End Date"
              placeholder="Select end date"
              icon={Calendar}
              required
              disabled={isSubmitting}
              disableFutureDates={false}
            />
          </div>

          <FormSelect
            form={form}
            name="priority"
            label="Priority"
            placeholder="Select priority level"
            options={priorityOptions}
            icon={AlertCircle}
            required
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Form>
  );
}
