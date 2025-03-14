import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  User as UserIcon,
  Building2,
  GraduationCap,
  Users2,
  MapPin,
  UserCircle,
  Shield,
  Briefcase,
} from "lucide-react";
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
    <CardContent className="flex items-start p-4 gap-4">
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
    </CardContent>
  </Card>
);

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3">
    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary/80 to-primary/50" />
    <h3 className="text-lg font-semibold text-foreground">{children}</h3>
  </div>
);

const getBasicFields = (user) => {
  const basicFields = [
    {
      icon: UserIcon,
      label: "Full Name",
      value: user?.name,
    },
    {
      icon: Mail,
      label: "Email",
      value: user?.email,
    },
  ];

  // Add gender field if the role has it
  if (user?.gender || user?.studentGender) {
    basicFields.push({
      icon: UserCircle,
      label: "Gender",
      value: user?.gender || user?.studentGender,
    });
  }

  return basicFields;
};

const RoleSpecificFields = ({ user }) => {
  const roleFields = {
    Student: [
      {
        icon: GraduationCap,
        label: "Student Number",
        value: user.studentNumber,
      },
      {
        icon: Building2,
        label: "Department",
        value: user.department,
      },
      {
        icon: Users2,
        label: "Level",
        value: user.level,
      },
    ],
    CommercialJob: [
      {
        icon: MapPin,
        label: "Address",
        value: user.address,
      },
    ],
    Coordinator: [
      {
        icon: Building2,
        label: "Department",
        value: user.department,
      },
      {
        icon: Users2,
        label: "Level",
        value: user.level,
      },
    ],
    JobOrder: [
      {
        icon: Briefcase,
        label: "Job Type",
        value: user.jobType,
      },
      {
        icon: Building2,
        label: "Job Description",
        value: user.jobDescription,
      },
    ],
    SuperAdmin: [
      {
        icon: Shield,
        label: "Access Level",
        value: user.accessLevel || "full",
      },
    ],
  };

  const fields = roleFields[user.role] || [];

  if (fields.length === 0) return null;

  const getSectionTitle = (role) => {
    switch (role) {
      case "Student":
      case "Coordinator":
        return "School Information";
      default:
        return "Role Information";
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle>{getSectionTitle(user.role)}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field, index) => (
          <InfoCard
            key={index}
            icon={field.icon}
            label={field.label}
            value={field.value}
          />
        ))}
      </div>
    </div>
  );
};

const ProfileTab = ({ user }) => {
  const basicFields = getBasicFields(user);

  return (
    <div className="space-y-8">
      {/* Profile Avatar and Name */}
      <div className="relative">
        <div className="absolute inset-0 h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border border-border/50 dark:from-primary/10 dark:via-primary/5" />
        <div className="relative pt-8 px-4 flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
            <AvatarImage src={user?.photo} alt={user?.name} />
            <AvatarFallback className="text-lg bg-muted text-foreground">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center pb-4">
            <h3 className="text-xl font-semibold text-foreground">
              {user?.name}
            </h3>
            <Badge
              variant="outline"
              className="bg-card/80 backdrop-blur-sm border-border/50 dark:bg-card/40 dark:border-border/30 font-medium"
            >
              {user?.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Basic User Details */}
      <div className="space-y-6">
        <SectionTitle>Basic Information</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {basicFields.map((field, index) => (
            <InfoCard
              key={index}
              icon={field.icon}
              label={field.label}
              value={field.value}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={user?.verified ? "success" : "destructive"}
            className="text-xs font-medium shadow-sm dark:shadow-none"
          >
            {user?.verified ? "Verified" : "Not Verified"}
          </Badge>
          {user?.isActive !== undefined && (
            <Badge
              variant={user?.isActive ? "success" : "destructive"}
              className="text-xs font-medium shadow-sm dark:shadow-none"
            >
              {user?.isActive ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>
      </div>

      {/* Role-specific fields */}
      <RoleSpecificFields user={user} />
    </div>
  );
};

export default ProfileTab;
