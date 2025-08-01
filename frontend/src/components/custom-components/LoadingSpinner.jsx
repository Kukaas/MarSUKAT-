import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ message = "Loading Data" }) => (
  <div className="min-h-[50vh] md:h-[200px] w-full flex items-center justify-center">
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="relative">
        <div className="absolute -inset-3 rounded-full bg-primary/10 animate-pulse"></div>
        <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-base font-medium text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground/60">
          Please wait while we fetch your information
        </p>
      </div>
    </div>
  </div>
);
