import FormSelect from "@/components/custom-components/FormSelect";
import FormDateInput from "@/components/custom-components/FormDateInput";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Calendar,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import { employeeAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

const accomplishmentTypes = [
  { value: "Sewing", label: "Sewing" },
  { value: "Pattern Making", label: "Pattern Making" },
  { value: "Cutting", label: "Cutting" },
  { value: "Quality Control", label: "Quality Control" },
  { value: "Material Preparation", label: "Material Preparation" },
  { value: "Finishing", label: "Finishing" },
  { value: "Alterations", label: "Alterations" },
  { value: "Maintenance", label: "Maintenance" },
];

const formSchema = z.object({
  assignedEmployee: z.string().min(1, "Employee is required"),
  accomplishmentType: z.string().min(1, "Accomplishment type is required"),
  dateStarted: z.string().min(1, "Start date is required"),
  dateAccomplished: z.string().min(1, "Accomplishment date is required"),
});

export function AccomplishmentReportForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}) {
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const formRef = useRef(null);

  // Initialize form with formData values
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignedEmployee: formData?.assignedEmployee?._id || "",
      accomplishmentType: formData?.accomplishmentType || "",
      dateStarted: formData?.dateStarted ? new Date(formData.dateStarted).toISOString().split('T')[0] : "",
      dateAccomplished: formData?.dateAccomplished ? new Date(formData.dateAccomplished).toISOString().split('T')[0] : "",
    },
    mode: "onTouched",
  });

  // Fetch active employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeAPI.getActiveEmployees();
        const employeeOptions = data.map(emp => ({
          value: emp._id,
          label: emp.name
        }));
        setEmployees(employeeOptions);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Update form values when formData changes
  useEffect(() => {
    if (formData) {
      form.reset({
        assignedEmployee: formData.assignedEmployee?._id || "",
        accomplishmentType: formData.accomplishmentType || "",
        dateStarted: formData.dateStarted ? new Date(formData.dateStarted).toISOString().split('T')[0] : "",
        dateAccomplished: formData.dateAccomplished ? new Date(formData.dateAccomplished).toISOString().split('T')[0] : "",
      });
    }
  }, [formData, form]);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        id="accomplishmentReportForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="space-y-8">
          {/* Report ID (if editing) */}
          {isEdit && formData?.reportId && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <span className="font-medium">Report ID: {formData.reportId}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Form Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormSelect
              form={form}
              name="assignedEmployee"
              label="Assigned Employee"
              placeholder="Select an employee"
              options={employees}
              icon={User}
              required
              disabled={isSubmitting}
              isLoading={isLoadingEmployees}
            />

            <FormSelect
              form={form}
              name="accomplishmentType"
              label="Accomplishment Type"
              placeholder="Select type"
              options={accomplishmentTypes}
              icon={CheckCircle}
              required
              disabled={isSubmitting}
            />
            <FormDateInput
              form={form}
              name="dateStarted"
              label="Date Started"
              placeholder="Select start date"
              icon={Calendar}
              required
              disabled={isSubmitting}
              disableFutureDates={true}
            />

            <FormDateInput
              form={form}
              name="dateAccomplished"
              label="Date Accomplished"
              placeholder="Select end date"
              icon={Calendar}
              required
              disabled={isSubmitting}
              disableFutureDates={true}
            />
          </div>
        </div>
      </form>
    </Form>
  );
} 