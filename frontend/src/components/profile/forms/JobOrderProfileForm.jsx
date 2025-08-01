import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import FormSelect from "@/components/custom-components/FormSelect";
import { SectionTitle } from "../ProfileComponents";
import { User, Mail, Briefcase, UserCircle } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export const JobOrderProfileForm = ({ form }) => {
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

      {/* Job Information */}
      <div className="space-y-4">
        <SectionTitle>Job Information</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            form={form}
            name="gender"
            label="Gender"
            placeholder="Select your gender"
            options={genderOptions}
            icon={UserCircle}
            defaultValue={form.getValues("gender")}
          />
          <FormInput
            form={form}
            name="position"
            label="Position"
            placeholder="Enter your position"
            icon={Briefcase}
            disabled
            readOnly
          />
        </div>
      </div>
    </div>
  );
};
