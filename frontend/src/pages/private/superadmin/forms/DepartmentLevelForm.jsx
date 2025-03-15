import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormSelect from "@/components/custom-components/FormSelect";
import { Building2, GraduationCap } from "lucide-react";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
import { toast } from "sonner";

const formSchema = z.object({
  departmentId: z.string({
    required_error: "Please select a department",
  }),
  levelId: z.string({
    required_error: "Please select a level",
  }),
});

// Helper function to sort options alphabetically
const sortOptionsAlphabetically = (data, labelKey) => {
  return data
    .map((item) => ({
      value: item._id,
      label: item[labelKey],
      name: item[labelKey], // Add the name for reference
    }))
    .sort((a, b) =>
      a.label
        .trim()
        .localeCompare(b.label.trim(), "en", { sensitivity: "base" })
    );
};

export function DepartmentLevelForm({
  onSubmit,
  isSubmitting = false,
  defaultValues = null,
}) {
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departmentId: defaultValues?.departmentId?._id || "",
      levelId: defaultValues?.levelId?._id || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        departmentId: defaultValues.departmentId._id,
        levelId: defaultValues.levelId._id,
      });
    }
  }, [defaultValues, form]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch both departments and levels in parallel
        const [departmentsData, levelsData] = await Promise.all([
          systemMaintenanceAPI.getAllDepartments(),
          systemMaintenanceAPI.getAllLevels(),
        ]);

        // Sort departments alphabetically by department name
        const sortedDepartments = sortOptionsAlphabetically(
          departmentsData,
          "department"
        );
        setDepartments(sortedDepartments);

        // Sort levels alphabetically by level name
        const sortedLevels = sortOptionsAlphabetically(levelsData, "level");
        setLevels(sortedLevels);
      } catch (error) {
        toast.error("Failed to fetch options");
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (data) => {
    try {
      // Find the selected department and level objects
      const selectedDepartment = departments.find(
        (d) => d.value === data.departmentId
      );
      const selectedLevel = levels.find((l) => l.value === data.levelId);

      // Add the names to the submitted data
      const enrichedData = {
        ...data,
        departmentName: selectedDepartment.name,
        levelName: selectedLevel.name,
      };

      await onSubmit(enrichedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        id="departmentLevelForm"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormSelect
          form={form}
          name="levelId"
          label="Level"
          placeholder="Select level"
          options={levels}
          icon={GraduationCap}
          disabled={isSubmitting}
        />
        <FormSelect
          form={form}
          name="departmentId"
          label="Department"
          placeholder="Select department"
          options={departments}
          icon={Building2}
          disabled={isSubmitting}
        />
      </form>
    </Form>
  );
}
