import { useState, useRef } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Image, X, Upload, Camera, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ImageUpload = ({
  form,
  name,
  label,
  disabled = false,
  className,
  maxSize = 5, // Max size in MB
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event, field) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      form.setError(name, {
        type: "manual",
        message: `Invalid file type. Accepted types: ${acceptedTypes
          .map((type) => type.split("/")[1].toUpperCase())
          .join(", ")}`,
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      form.setError(name, {
        type: "manual",
        message: `File size must be less than ${maxSize}MB`,
      });
      return;
    }

    // Read and set preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      field.onChange({
        filename: file.name,
        contentType: file.type,
        data: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field) => {
    setPreview(null);
    field.onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("w-full", className)}>
          <FormLabel className="text-base font-semibold">{label}</FormLabel>
          <FormControl>
            <div className="space-y-3">
              {/* Main Container */}
              <div
                className={cn(
                  "relative w-full aspect-[16/9] rounded-lg overflow-hidden transition",
                  "border-2 border-dashed bg-background/50",
                  disabled
                    ? "opacity-50 cursor-not-allowed border-muted"
                    : "hover:border-primary hover:bg-accent/50 cursor-pointer group border-muted-foreground/25",
                  "flex items-center justify-center"
                )}
                onClick={() => !disabled && fileInputRef.current?.click()}
              >
                {/* Preview Layer */}
                {(preview || field.value?.data) && (
                  <div className="absolute inset-0 z-20">
                    <img
                      src={preview || field.value.data}
                      alt="Preview"
                      className="w-full h-full object-contain p-4"
                    />
                    {/* Desktop Hover Overlay */}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-sm font-medium text-primary">
                          Click to change image
                        </p>
                      </div>
                    </div>
                    {/* Mobile Touch Hint */}
                    <div className="absolute inset-0 flex items-center justify-center md:hidden">
                      <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Interface Layer */}
                {!preview && !field.value?.data && (
                  <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center space-y-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm md:text-base font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="hidden md:inline">
                          Click to upload or drag and drop
                        </span>
                        <span className="md:hidden">Tap to upload image</span>
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground/75">
                        PNG, JPG or WEBP (max. {maxSize}MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={acceptedTypes.join(",")}
                  onChange={(e) => handleFileChange(e, field)}
                  disabled={disabled}
                />
              </div>

              {/* Persistent Action Buttons */}
              {(preview || field.value?.data) && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="h-9"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                  >
                    <Camera className="h-4 w-4" />
                    <span className="hidden md:inline">Change</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="default"
                    className="h-9"
                    onClick={() => handleRemoveImage(field)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden md:inline">Remove</span>
                  </Button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-xs mt-2" />
        </FormItem>
      )}
    />
  );
};

export default ImageUpload;
