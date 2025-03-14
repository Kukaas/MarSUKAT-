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
        jobType: z.string().min(1, "Job type is required"),
        jobDescription: z.string().min(1, "Job description is required"),
      });
    default:
      return z.object({
        ...baseSchema,
      });
  }
};

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

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
        jobType: user?.jobType || "",
        jobDescription: user?.jobDescription || "",
      }),
      ...(user?.role === "SuperAdmin" && {
        accessLevel: user?.accessLevel || "full",
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
          jobType: user.jobType || "",
          jobDescription: user.jobDescription || "",
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

  const getProfileForm = () => {
    switch (user?.role) {
      case "Student":
        return <StudentProfileForm form={form} />;
      case "Coordinator":
        return <CoordinatorProfileForm form={form} />;
      case "JobOrder":
        return <JobOrderProfileForm form={form} />;
      case "CommercialJob":
        return <CommercialJobProfileForm form={form} />;
      case "SuperAdmin":
        return <SuperAdminProfileForm form={form} />;
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form id="updateProfileForm" onSubmit={form.handleSubmit(onSubmit)}>
        {getProfileForm()}
      </form>
    </Form>
  );
};

export default UpdateProfileTab;
