import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ImageUpload = ({ form, name = "photo" }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        form.setError(name, {
          message: "Image size should be less than 10MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setPreviewUrl(base64Data);
        form.setValue(name, {
          filename: file.name,
          contentType: file.type,
          data: base64Data,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    form.setValue(name, {
      filename: "default-profile",
      contentType: "image/png",
      data: "",
    });
  };

  const currentPhotoData = form.watch(name)?.data;
  const displayUrl = previewUrl || currentPhotoData;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col items-center space-y-4">
          <FormLabel className="text-center text-sm text-muted-foreground">
            Click the buttons below to manage your profile photo
          </FormLabel>
          <div className="relative">
            <Avatar
              className={cn(
                "h-24 w-24 ring-2",
                "ring-background shadow-md",
                "transition-all duration-200",
                "cursor-pointer hover:opacity-90",
                displayUrl ? "ring-primary/50" : "ring-muted"
              )}
              onClick={() => document.getElementById(`${name}-upload`).click()}
            >
              <AvatarImage src={displayUrl} />
              <AvatarFallback className="bg-muted cursor-pointer">
                {form.watch("name")?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => document.getElementById(`${name}-upload`).click()}
            >
              <Camera className="h-4 w-4" />
              <span className="text-sm">Upload Photo</span>
            </Button>
            {displayUrl && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
                <span className="text-sm">Remove</span>
              </Button>
            )}
          </div>

          <input
            id={`${name}-upload`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
