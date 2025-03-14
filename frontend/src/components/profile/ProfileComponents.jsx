import { cn } from "@/lib/utils";

export const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3">
    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary/80 to-primary/50" />
    <h3 className="text-lg font-semibold text-foreground">{children}</h3>
  </div>
);

export const InfoCard = ({ icon: Icon, label, value, className }) => (
  <div
    className={cn(
      "group border border-border/50 rounded-md shadow-sm",
      "bg-card hover:bg-accent transition-colors duration-200",
      "dark:bg-card/95 dark:hover:bg-accent/90",
      className
    )}
  >
    <div className="flex items-start p-4 gap-4">
      <div className="rounded-full bg-primary/10 p-2.5 ring-1 ring-border/50 shrink-0 dark:bg-primary/20 group-hover:ring-primary/50 transition-all duration-200">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-muted-foreground truncate">
          {label}
        </p>
        <p className="font-medium break-words text-foreground">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  </div>
);
