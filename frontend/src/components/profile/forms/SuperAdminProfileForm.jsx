import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import FormInput from "@/components/custom-components/FormInput";
import { SectionTitle } from "../ProfileComponents";
import { User, Mail } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

export const SuperAdminProfileForm = ({ form }) => {
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
    </div>
  );
};
