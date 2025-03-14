import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  User,
  Mail,
  UserSquare2,
  Building2,
  Users,
  GraduationCap,
  MapPin,
  UserCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import PublicLayout from "./PublicLayout";
import LeftDescription from "@/components/auth/LeftDescription";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import PasswordInput from "@/components/custom-components/PasswordInput";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { authAPI, systemMaintenanceAPI } from "@/lib/api";

const formSchema = z.object({
  role: z.string().min(1, "Please select a role"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  studentNumber: z.string().optional(),
  studentGender: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
});

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [departmentLevels, setDepartmentLevels] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      name: "",
      email: "",
      password: "",
      studentNumber: "",
      studentGender: "",
      department: "",
      level: "",
      address: "",
      gender: "",
    },
  });

  const role = form.watch("role");
  const selectedLevel = form.watch("level");

  // Fetch active department levels
  useEffect(() => {
    const fetchDepartmentLevels = async () => {
      try {
        const data = await systemMaintenanceAPI.getActiveDepartmentLevels();
        setDepartmentLevels(data);

        // Extract unique levels for students and coordinators
        if (role === "student" || role === "coordinator") {
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

    if (role === "student" || role === "coordinator") {
      fetchDepartmentLevels();
    }
  }, [role]);

  // Update department options when level is selected (for students)
  useEffect(() => {
    if (role === "student" || role === "coordinator") {
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
    }
  }, [selectedLevel, departmentLevels, role]);

  const getMaxSteps = () => {
    return 4;
  };

  const onSubmit = async (data) => {
    try {
      if (step < getMaxSteps()) {
        setStep(step + 1);
        return;
      }

      setIsLoading(true);

      // Transform role value to match backend expectations
      const transformedRole = data.role.toLowerCase();

      // Prepare the data based on role
      const signupData = {
        role: transformedRole,
        name: data.name,
        email: data.email,
        password: data.password,
      };

      // Add role-specific fields
      switch (transformedRole) {
        case "student":
          signupData.studentNumber = data.studentNumber;
          signupData.studentGender = data.studentGender;
          signupData.department = data.department;
          signupData.level = data.level;
          break;
        case "commercial":
          signupData.address = data.address;
          signupData.gender = data.gender;
          break;
        case "coordinator":
          signupData.department = data.department;
          signupData.gender = data.gender;
          signupData.level = data.level;
          break;
      }

      const response = await authAPI.signup(signupData);

      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account.",
      });

      // Reset form and navigate to login
      form.reset();
      navigate("/login");
    } catch (error) {
      // Handle specific error cases
      if (error.response?.data?.message) {
        // Show the specific error message from the backend
        toast.error("Signup failed", {
          description: error.response.data.message,
        });

        // Handle validation errors for specific fields
        if (error.response.data.errors) {
          error.response.data.errors.forEach((errorMsg) => {
            // Extract field name from error message if possible
            const field = errorMsg.toLowerCase().split(" ")[0];
            if (form.getValues(field)) {
              form.setError(field, { message: errorMsg });
            }
          });
        }
      } else {
        // Show a generic error message
        toast.error("Signup failed", {
          description: "An unexpected error occurred. Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !role) {
      form.setError("role", { message: "Please select a role" });
      return;
    }

    // Validate current step fields before proceeding
    const currentStepFields = getStepFields(step);
    const isValid = currentStepFields.every((field) => {
      const value = form.getValues(field);
      if (!value) {
        form.setError(field, { message: `${field} is required` });
        return false;
      }
      return true;
    });

    if (isValid) {
      setStep(step + 1);
    }
  };

  const getStepFields = (currentStep) => {
    switch (currentStep) {
      case 1:
        return ["role"];
      case 2:
        return ["name", "email"];
      case 3:
        return ["password"];
      case 4:
        if (role === "student") {
          return ["studentNumber", "studentGender", "department", "level"];
        } else if (role === "commercial") {
          return ["address", "gender"];
        } else if (role === "coordinator") {
          return ["department", "gender"];
        }
        return [];
      default:
        return [];
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "commercial", label: "Commercial Job" },
    { value: "coordinator", label: "Coordinator" },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <SectionHeader title="Account Type" />
            <FormSelect
              form={form}
              name="role"
              label="Role"
              placeholder="Select role"
              options={roleOptions}
              icon={UserSquare2}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <SectionHeader title="Personal Information" />
            <FormInput
              form={form}
              name="name"
              label="Name"
              placeholder="Enter your name"
              icon={User}
            />
            <FormInput
              form={form}
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={Mail}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <SectionHeader title="Security" />
            <PasswordInput
              form={form}
              name="password"
              label="Password"
              placeholder="Enter your password"
            />
          </div>
        );
      case 4:
        if (!role) return null;
        return (
          <div className="space-y-6">
            <SectionHeader title="Additional Information" />
            {renderRoleSpecificFields()}
          </div>
        );
      default:
        return null;
    }
  };

  const renderRoleSpecificFields = () => {
    switch (role) {
      case "student":
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                form={form}
                name="studentNumber"
                label="Student Number"
                placeholder="Enter student number"
                icon={GraduationCap}
              />
              <FormSelect
                form={form}
                name="studentGender"
                label="Gender"
                placeholder="Select gender"
                options={genderOptions}
                icon={UserCircle2}
              />
            </div>
            <FormSelect
              form={form}
              name="level"
              label="Level"
              placeholder="Select level"
              options={levelOptions}
              icon={Users}
            />
            <FormSelect
              form={form}
              name="department"
              label="Department"
              placeholder="Select department"
              options={departmentOptions}
              icon={Building2}
              disabled={!form.watch("level")}
            />
          </>
        );
      case "commercial":
        return (
          <>
            <FormInput
              form={form}
              name="address"
              label="Address"
              placeholder="Enter address"
              icon={MapPin}
            />
            <FormSelect
              form={form}
              name="gender"
              label="Gender"
              placeholder="Select gender"
              options={genderOptions}
              icon={UserCircle2}
              className="w-full sm:w-1/2"
            />
          </>
        );
      case "coordinator":
        return (
          <>
            <FormSelect
              form={form}
              name="level"
              label="Level"
              placeholder="Select level"
              options={levelOptions}
              icon={Users}
            />
            <FormSelect
              form={form}
              name="department"
              label="Department"
              placeholder="Select department"
              options={departmentOptions}
              icon={Building2}
              disabled={!form.watch("level")}
            />
            <FormSelect
              form={form}
              name="gender"
              label="Gender"
              placeholder="Select gender"
              options={genderOptions}
              icon={UserCircle2}
              className="w-full sm:w-1/2"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <PublicLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:block lg:relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            <LeftDescription
              title="Create an Account Today"
              description="Join MarSUKAT to access internship opportunities, connect with companies, and kickstart your career journey."
            />
          </div>
        </div>

        <div className="lg:col-start-2 mt-10">
          <div className="min-h-screen bg-background">
            <div className="w-full px-6 py-16 lg:px-8 xl:px-12">
              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <h2 className="text-4xl font-bold tracking-tight text-foreground">
                    Get Started
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground">
                    Please fill in the information below to create your account
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {Array.from({ length: getMaxSteps() }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          index + 1 === step
                            ? "w-8 bg-foreground"
                            : index + 1 < step
                            ? "w-2 bg-foreground"
                            : "w-2 bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Card className="group hover:shadow-xl transition-all border-border bg-card">
                  <CardContent className="p-8">
                    <Form {...form}>
                      <form className="space-y-8">
                        {renderStepContent()}

                        <div className="flex items-center justify-between gap-4 pt-4">
                          {step > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-11 px-6"
                              onClick={handleBack}
                              disabled={isLoading}
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={
                              step === getMaxSteps()
                                ? form.handleSubmit(onSubmit)
                                : handleNext
                            }
                            className={`h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                              step === 1 ? "w-full" : "px-6 ml-auto"
                            }`}
                            disabled={isLoading}
                          >
                            {isLoading && (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {step === getMaxSteps() ? (
                              "Create Account"
                            ) : (
                              <>
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>

                        {step === 1 && (
                          <p className="text-center text-sm text-muted-foreground mt-6">
                            Already have an account?{" "}
                            <Link
                              to="/login"
                              className="font-medium text-primary hover:text-primary/90 transition-colors"
                            >
                              Login here
                            </Link>
                          </p>
                        )}
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default SignUp;
