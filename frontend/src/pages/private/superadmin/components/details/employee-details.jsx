import { formatDate, cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Info,
  Briefcase,
  Camera
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const InfoCard = ({ icon: Icon, label, value, className }) => (
  <Card
    className={cn(
      "group border-border/50 shadow-sm",
      "bg-card hover:bg-accent transition-colors duration-200",
      "dark:bg-card/95 dark:hover:bg-accent/90",
      className
    )}
  >
    <CardContent className="flex items-start p-3 sm:p-4 gap-3 sm:gap-4">
      <div className="rounded-full bg-primary/10 p-2 sm:p-2.5 ring-1 ring-border/50 shrink-0 dark:bg-primary/20 group-hover:ring-primary/50 transition-all duration-200">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-medium break-words text-foreground">
          {value || "Not specified"}
        </p>
      </div>
    </CardContent>
  </Card>
);

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="h-5 sm:h-6 w-1 rounded-full bg-gradient-to-b from-primary/80 to-primary/50" />
    <h3 className="text-base sm:text-lg font-semibold text-foreground">
      {children}
    </h3>
  </div>
);

function EmployeeContent({ item }) {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Employee Info */}
        <div className="relative">
          <div className="absolute inset-0 h-48 sm:h-52 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
          <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
            {/* Employee Avatar/Image */}
            <div className="relative">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-background shadow-xl">
                {item?.image?.data ? (
                  <AvatarImage
                    src={item.image.data}
                    alt={item.name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl">
                    {getInitials(item?.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="text-center pb-3 sm:pb-4 pt-2">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                {item?.name || "-"}
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {item?.positions?.map((position, index) => (
                  <Badge key={index} variant="secondary">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {position}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Contact Information</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard
              icon={Mail}
              label="Email"
              value={item?.email || "-"}
            />
            <InfoCard
              icon={Phone}
              label="Contact Number"
              value={item?.contactNumber || "-"}
            />
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>Location Details</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard
              icon={MapPin}
              label="Municipality"
              value={item?.municipality || "-"}
            />
            <InfoCard
              icon={MapPin}
              label="Barangay"
              value={item?.barangay || "-"}
            />
          </div>
        </div>

        {/* Full Employee Photo */}
        {item?.image?.data && (
          <div className="space-y-4 sm:space-y-6">
            <SectionTitle>Employee Photo</SectionTitle>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[4/5] w-full max-w-[300px] mx-auto">
                  <img
                    src={item.image.data}
                    alt={item.name}
                    className="object-cover w-full h-full rounded-lg"
                  />
                  <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History */}
        <div className="space-y-4 sm:space-y-6">
          <SectionTitle>History</SectionTitle>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <InfoCard
              icon={Calendar}
              label="Created At"
              value={formatDate(item?.createdAt, "long")}
            />
            <InfoCard
              icon={Calendar}
              label="Updated At"
              value={formatDate(item?.updatedAt, "long") || "Not updated yet"}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

const EmployeeDetailsDialog = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title="Employee Details"
    >
      <EmployeeContent item={item} />
    </ViewDetailsDialog>
  );
};

// Add EmployeeDetails export for backward compatibility
const EmployeeDetails = ({ item }) => (
  <EmployeeContent item={item} />
);

export { EmployeeDetailsDialog, EmployeeDetails };
