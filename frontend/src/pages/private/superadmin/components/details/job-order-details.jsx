import * as React from "react";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusBadge from "@/components/custom-components/StatusBadge";
import {
  User,
  Calendar,
  CheckCircle2,
  Ban,
  Pencil,
  Mail,
  Users,
  Briefcase,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-sm sm:text-base font-medium break-words text-foreground">
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

const JobOrderContent = ({ data, onEdit, onApprove, onReject }) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Status */}
      <div className="relative">
        <div className="absolute inset-0 h-32 sm:h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
        <div className="relative pt-6 sm:pt-8 px-4 flex flex-col items-center space-y-3 sm:space-y-4">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background shadow-xl">
            <AvatarImage
              src={data?.photo?.data || undefined}
              alt={data?.name}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-8 w-8 sm:h-10 sm:w-10" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center pb-3 sm:pb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              {data.name || "Job Order"}
            </h3>
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <StatusBadge
                status={data.jobType}
                icon={Briefcase}
                className="text-xs sm:text-sm"
              />
              <StatusBadge
                status={data.isActive ? "Active" : "Inactive"}
                icon={Activity}
                className="text-xs sm:text-sm"
              />
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="h-7 px-2 text-xs rounded-full bg-card/80 backdrop-blur-sm border-border/50 dark:bg-card/40"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4 sm:space-y-6">
        <SectionTitle>Basic Information</SectionTitle>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <InfoCard icon={User} label="Full Name" value={data.name} />
          <InfoCard
            icon={Mail}
            label="Email"
            value={
              <a
                href={`mailto:${data.email}`}
                className="text-primary hover:underline"
              >
                {data.email}
              </a>
            }
          />
          <InfoCard icon={Users} label="Gender" value={data.gender} />
          <InfoCard
            icon={Calendar}
            label="Created At"
            value={format(new Date(data.createdAt), "MMMM do, yyyy")}
          />
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-4 sm:space-y-6">
        <SectionTitle>Job Description</SectionTitle>
        <Card className="group border-border/50 shadow-sm bg-card dark:bg-card/95">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {data.jobDescription || "No description provided"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {(onApprove || onReject) && (
        <div className="flex items-center justify-end gap-3">
          {onReject && (
            <Button
              variant="outline"
              onClick={onReject}
              className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Ban className="h-4 w-4 mr-2" />
              Reject
            </Button>
          )}
          {onApprove && (
            <Button
              variant="outline"
              onClick={onApprove}
              className="rounded-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const JobOrderDetailsDialog = ({
  isOpen,
  onClose,
  data,
  onEdit,
  onApprove,
  onReject,
}) => {
  if (!data) return null;

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title="Job Order Details"
    >
      <JobOrderContent
        data={data}
        onEdit={onEdit}
        onApprove={onApprove}
        onReject={onReject}
      />
    </ViewDetailsDialog>
  );
};

export { JobOrderDetailsDialog };
