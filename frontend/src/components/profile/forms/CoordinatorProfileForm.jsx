import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { SectionTitle } from "../ProfileComponents";
import { User, Mail, Building2, Users2, UserCircle } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { useEffect, useState } from "react";
import { systemMaintenanceAPI } from "@/lib/api";
import { toast } from "sonner";

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const CoordinatorProfileForm = ({ form }) => {
  const [departmentLevels, setDepartmentLevels] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedLevel = form.watch("level");

  // Fetch active department levels
  useEffect(() => {
    const fetchDepartmentLevels = async () => {
      setIsLoading(true);
      try {
        const data = await systemMaintenanceAPI.getActiveDepartmentLevels();
        setDepartmentLevels(data);

        // Extract unique levels
        const uniqueLevels = [
          ...new Set(data.filter((dl) => dl.isActive).map((dl) => dl.level)),
        ]
          .map((level) => ({
            value: level,
            label: level,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setLevelOptions(uniqueLevels);
      } catch (error) {
        toast.error("Failed to fetch department levels");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentLevels();
  }, []);

  // Update department options when level is selected
  useEffect(() => {
    if (selectedLevel && departmentLevels.length > 0) {
      const availableDepartments = departmentLevels
        .filter((dl) => dl.level === selectedLevel && dl.isActive)
        .map((dl) => ({
          value: dl.department,
          label: dl.department,
        }));

      // Remove duplicates
      const uniqueDepartments = [
        ...new Map(
          availableDepartments.map((item) => [item.value, item])
        ).values(),
      ];
      setDepartmentOptions(uniqueDepartments);
    } else {
      setDepartmentOptions([]);
    }
  }, [selectedLevel, departmentLevels]);

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="flex justify-center">
        <ImageUpload form={form} />
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <SectionTitle>Basic Information</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            form={form}
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            icon={User}
          />
          <FormInput
            form={form}
            name="email"
            label="Email"
            placeholder="Enter your email"
            icon={Mail}
            disabled
            readOnly
          />
        </div>
      </div>

      {/* Coordinator Information */}
      <div className="space-y-4">
        <SectionTitle>Coordinator Information</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            form={form}
            name="level"
            label="Level"
            placeholder="Select your level"
            options={levelOptions}
            icon={Users2}
            isLoading={isLoading}
          />
          <FormSelect
            form={form}
            name="department"
            label="Department"
            placeholder="Select your department"
            options={departmentOptions}
            icon={Building2}
            disabled={!selectedLevel}
            isLoading={isLoading && selectedLevel}
          />
          <FormSelect
            form={form}
            name="gender"
            label="Gender"
            placeholder="Select your gender"
            options={genderOptions}
            icon={UserCircle}
          />
        </div>
      </div>
    </div>
  );
};
