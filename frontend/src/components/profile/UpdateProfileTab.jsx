import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userAPI, systemMaintenanceAPI } from "@/lib/api";
import { SectionTitle } from "./ProfileComponents";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Mail,
  User,
  MapPin,
  GraduationCap,
  Building2,
  Briefcase,
  UserCircle,
  Users,
} from "lucide-react";
import { StudentProfileForm } from "./forms/StudentProfileForm";
import { CoordinatorProfileForm } from "./forms/CoordinatorProfileForm";
import { JobOrderProfileForm } from "./forms/JobOrderProfileForm";
import { CommercialJobProfileForm } from "./forms/CommercialJobProfileForm";
import { SuperAdminProfileForm } from "./forms/SuperAdminProfileForm";
import { BAOProfileForm } from "./forms/BAOProfileForm";
import { ImageUpload } from "./forms/ImageUpload";

// Create a schema for profile validation
const createProfileSchema = (role) => {
  const baseSchema = {
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
  };

  // Add role-specific validation
  switch (role) {
    case "Student":
      return z.object({
        ...baseSchema,
        studentNumber: z.string().min(1, "Student number is required"),
        studentGender: z.string().min(1, "Gender is required"),
        department: z.string().min(1, "Department is required"),
        level: z.string().min(1, "Level is required"),
      });
    case "CommercialJob":
      return z.object({
        ...baseSchema,
        address: z.string().min(1, "Address is required"),
        gender: z.string().min(1, "Gender is required"),
      });
    case "Coordinator":
      return z.object({
        ...baseSchema,
        department: z.string().min(1, "Department is required"),
        level: z.string().min(1, "Level is required"),
        gender: z.string().min(1, "Gender is required"),
      });
    case "JobOrder":
      return z.object({
        ...baseSchema,
        gender: z.string().min(1, "Gender is required"),
        position: z.string().min(1, "Position is required"),
      });
    case "BAO":
      return z.object({
        ...baseSchema,
        position: z.string().min(1, "Position is required"),
      });
    default:
      return z.object({
        ...baseSchema,
      });
  }
};


const UpdateProfileTab = ({
  onSubmitSuccess,
  isSubmitting,
  setIsSubmitting,
}) => {
  const { user, updateUserInfo } = useAuth();
  const [departmentLevels, setDepartmentLevels] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);

  // Create form schema based on user role
  const profileSchema = createProfileSchema(user?.role || "default");

  // Initialize the form
  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      photo: user?.photo || {
        filename: "",
        contentType: "",
        data: "",
      },
      ...(user?.role === "Student" && {
        studentNumber: user?.studentNumber || "",
        studentGender: user?.studentGender || "",
        department: user?.department || "",
        level: user?.level || "",
      }),
      ...(user?.role === "CommercialJob" && {
        address: user?.address || "",
        gender: user?.gender || "",
      }),
      ...(user?.role === "Coordinator" && {
        department: user?.department || "",
        level: user?.level || "",
        gender: user?.gender || "",
      }),
      ...(user?.role === "JobOrder" && {
        gender: user?.gender || "",
        position: user?.position || "",
      }),
      ...(user?.role === "SuperAdmin" && {
        accessLevel: user?.accessLevel || "full",
      }),
      ...(user?.role === "BAO" && {
        position: user?.position || "",
      }),
    },
    resolver: zodResolver(profileSchema),
  });

  // Get selected level for department filtering
  const selectedLevel = form.watch("level");

  // Fetch active department levels
  useEffect(() => {
    const fetchDepartmentLevels = async () => {
      try {
        const data = await systemMaintenanceAPI.getActiveDepartmentLevels();
        setDepartmentLevels(data);

        // Extract unique levels for students and coordinators
        if (user?.role === "Student" || user?.role === "Coordinator") {
          const uniqueLevels = [
            ...new Set(data.filter((dl) => dl.isActive).map((dl) => dl.level)),
          ]
            .map((level) => ({
              value: level,
              label: level,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          setLevelOptions(uniqueLevels);
        }
      } catch (error) {
        toast.error("Failed to fetch department levels");
      }
    };

    if (user?.role === "Student" || user?.role === "Coordinator") {
      fetchDepartmentLevels();
    }
  }, [user?.role]);

  // Update department options when level is selected
  useEffect(() => {
    if (
      (user?.role === "Student" || user?.role === "Coordinator") &&
      departmentLevels.length > 0
    ) {
      if (selectedLevel) {
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
    }
  }, [selectedLevel, departmentLevels, user?.role]);

  useEffect(() => {
    if (user) {
      const formValues = {
        name: user.name || "",
        email: user.email || "",
        photo: user.photo || {
          filename: "",
          contentType: "",
          data: "",
        },
        ...(user.role === "Student" && {
          studentNumber: user.studentNumber || "",
          studentGender: user.studentGender || "",
          department: user.department || "",
          level: user.level || "",
        }),
        ...(user.role === "CommercialJob" && {
          address: user.address || "",
          gender: user.gender || "",
        }),
        ...(user.role === "Coordinator" && {
          department: user.department || "",
          level: user.level || "",
          gender: user.gender || "",
        }),
        ...(user.role === "JobOrder" && {
          gender: user.gender || "",
          position: user.position || "",
        }),
        ...(user.role === "SuperAdmin" && {
          accessLevel: user.accessLevel || "full",
        }),
        ...(user.role === "BAO" && {
          position: user.position || "",
        }),
      };

      form.reset(formValues);
    }
  }, [user, form]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = {
        ...data,
        photo: form.getValues("photo"),
      };

      const response = await userAPI.updateProfile(user._id, formData);

      // Immediately update the user context with the new data
      updateUserInfo({
        ...response,
        photo: formData.photo, // Ensure photo state is immediately updated
      });

      toast.success("Profile updated successfully");
      onSubmitSuccess();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form id="updateProfileForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Role-specific Information */}
        <div className="space-y-4">
          {user?.role === "Student" && <StudentProfileForm form={form} />}
          {user?.role === "CommercialJob" && <CommercialJobProfileForm form={form} />}
          {user?.role === "Coordinator" && <CoordinatorProfileForm form={form} />}
          {user?.role === "JobOrder" && <JobOrderProfileForm form={form} />}
          {user?.role === "SuperAdmin" && <SuperAdminProfileForm form={form} />}
          {user?.role === "BAO" && <BAOProfileForm form={form} />}
        </div>
      </form>
    </Form>
  );
};

export default UpdateProfileTab;
