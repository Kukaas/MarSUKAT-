import { formatDate } from "@/lib/utils";
import { Building2, Calendar, FileText, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DepartmentDetails({ department }) {
  const detailItems = [
    {
      label: "Department ID",
      value: department?.departmentId || "-",
      icon: Building2,
      iconClassName: "text-blue-500",
    },
    {
      label: "Department",
      value: department?.department || "-",
      icon: FileText,
      iconClassName: "text-green-500",
    },
    {
      label: "Description",
      value: department?.description || "-",
      icon: Info,
      iconClassName: "text-purple-500",
    },
    {
      label: "Created At",
      value: formatDate(department?.createdAt, "long"),
      icon: Calendar,
      iconClassName: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-6 p-2">
      {detailItems.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors"
        >
          <div className={cn("p-2 rounded-full bg-white shadow-sm", "border")}>
            {item.icon && (
              <item.icon className={cn("h-5 w-5", item.iconClassName)} />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium text-gray-500">{item.label}</h4>
            <p className="text-sm font-medium text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
