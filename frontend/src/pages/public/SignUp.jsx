import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import PublicLayout from "./PublicLayout";
import LeftDescription from "@/components/auth/LeftDescription";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import PasswordInput from "@/components/custom-components/PasswordInput";
import SectionHeader from "@/components/custom-components/SectionHeader";

const formSchema = z.object({
  role: z.string().min(1, "Please select a role"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  studentNumber: z.string().optional(),
  studentGender: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
});

const SignUp = () => {
  const [step, setStep] = useState(1);
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

  const getMaxSteps = () => {
    return 4;
  };

  const onSubmit = async (data) => {
    try {
      if (step < getMaxSteps()) {
        setStep(step + 1);
        return;
      }

      console.log("Form submitted:", data);
      // TODO: Implement signup logic
      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      toast.error("Error creating account", {
        description: error.message,
      });
    }
  };

  const handleNext = () => {
    if (step === 1 && !role) {
      form.setError("role", { message: "Please select a role" });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const roleOptions = [
    { value: "Student", label: "Student" },
    { value: "CommercialJob", label: "Commercial Job" },
    { value: "Coordinator", label: "Coordinator" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const levelOptions = [
    { value: "1st", label: "1st Year" },
    { value: "2nd", label: "2nd Year" },
    { value: "3rd", label: "3rd Year" },
    { value: "4th", label: "4th Year" },
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
      case "Student":
        return (
          <>
            <FormInput
              form={form}
              name="studentNumber"
              label="Student Number"
              placeholder="Enter student number"
              icon={GraduationCap}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                form={form}
                name="studentGender"
                label="Gender"
                placeholder="Select gender"
                options={genderOptions}
                icon={UserCircle2}
              />
              <FormSelect
                form={form}
                name="level"
                label="Level"
                placeholder="Select level"
                options={levelOptions}
                icon={Users}
              />
            </div>
            <FormInput
              form={form}
              name="department"
              label="Department"
              placeholder="Enter department"
              icon={Building2}
            />
          </>
        );
      case "CommercialJob":
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
              className="w-1/2"
            />
          </>
        );
      case "Coordinator":
        return (
          <>
            <FormInput
              form={form}
              name="department"
              label="Department"
              placeholder="Enter department"
              icon={Building2}
            />
            <FormSelect
              form={form}
              name="gender"
              label="Gender"
              placeholder="Select gender"
              options={genderOptions}
              icon={UserCircle2}
              className="w-1/2"
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

        <div className="lg:col-start-2">
          <div className="min-h-screen bg-white lg:bg-gray-50/50">
            <div className="w-full px-6 py-16 lg:px-8 xl:px-12">
              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    Get Started
                  </h2>
                  <p className="mt-3 text-base text-gray-600">
                    Please fill in the information below to create your account
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {Array.from({ length: getMaxSteps() }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          index + 1 === step
                            ? "w-8 bg-gray-900"
                            : index + 1 < step
                            ? "w-2 bg-gray-900"
                            : "w-2 bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Card className="group hover:shadow-xl transition-all border-gray-100/50 bg-white">
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
                            className={`h-11 bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                              step === 1 ? "w-full" : "px-6 ml-auto"
                            }`}
                          >
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
                          <p className="text-center text-sm text-gray-500 mt-6">
                            Already have an account?{" "}
                            <Link
                              to="/login"
                              className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
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
