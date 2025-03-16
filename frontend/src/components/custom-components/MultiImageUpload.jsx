import { useRef } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus, X, Upload, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiImageUpload({
  form,
  name,
  label,
  disabled = false,
  className,
  maxImages = 5,
  maxSize = 5, // Max size in MB
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}) {
  // Create a map of refs instead of a single ref
  const fileInputRefs = useRef({});

  const handleFileChange = (event, field, index) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      form.setError(`${name}.${index}`, {
        type: "manual",
        message: `Invalid file type. Accepted types: ${acceptedTypes
          .map((type) => type.split("/")[1].toUpperCase())
          .join(", ")}`,
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      form.setError(`${name}.${index}`, {
        type: "manual",
        message: `File size must be less than ${maxSize}MB`,
      });
      return;
    }

    // Read and set image
    const reader = new FileReader();
    reader.onloadend = () => {
      const currentImages = [...(field.value || [])];
      currentImages[index] = {
        label: file.name,
        filename: file.name,
        contentType: file.type,
        data: reader.result,
      };
      field.onChange(currentImages);
    };
    reader.readAsDataURL(file);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-4", className)}>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <FormLabel className="text-base font-semibold">{label}</FormLabel>
              <p className="text-xs text-muted-foreground">
                {field.value?.length || 0} of {maxImages} images added
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentImages = field.value || [];
                if (currentImages.length < maxImages) {
                  field.onChange([
                    ...currentImages,
                    { filename: "", contentType: "", data: "" },
                  ]);
                }
              }}
              disabled={disabled || (field.value?.length || 0) >= maxImages}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>

          <FormControl>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {(field.value || []).map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative group rounded-lg overflow-hidden",
                    "bg-background/50 border border-border",
                    "transition duration-200",
                    "hover:border-primary/50",
                    "focus-within:border-primary",
                    disabled && "opacity-50"
                  )}
                >
                  {/* Remove button */}
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className={cn(
                        "absolute top-2 right-2 z-50 h-7 w-7",
                        "sm:opacity-0 opacity-90",
                        "sm:group-hover:opacity-100 transition-opacity",
                        "shadow-md"
                      )}
                      onClick={() => {
                        const newImages = [...field.value];
                        newImages.splice(index, 1);
                        field.onChange(newImages);
                      }}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Image preview or upload interface */}
                  <div
                    className="aspect-[16/9] cursor-pointer"
                    onClick={() =>
                      !disabled && fileInputRefs.current[index]?.click()
                    }
                  >
                    {image.data ? (
                      // Image preview
                      <div className="relative h-full">
                        <img
                          src={image.data}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-contain p-2"
                        />
                        {/* Change overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      // Upload interface
                      <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Click to upload
                          </p>
                          <p className="text-xs text-muted-foreground/75">
                            PNG, JPG or WEBP (max. {maxSize}MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    type="file"
                    className="hidden"
                    accept={acceptedTypes.join(",")}
                    onChange={(e) => handleFileChange(e, field, index)}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
