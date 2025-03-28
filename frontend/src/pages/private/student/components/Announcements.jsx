import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/custom-components/EmptyState";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { AlertCircle, Bell, Calendar } from "lucide-react";
import { dashboardAPI } from "../api/dashboardApi";
import { formatDate } from "@/lib/utils";
import { useDataFetching } from "@/hooks/useDataFetching";

const getPriorityStyles = (priority) => {
  switch (priority) {
    case "high":
      return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
    case "medium":
      return "border-l-orange-500 bg-orange-50 dark:bg-orange-900/10";
    case "low":
    default:
      return "border-l-primary bg-card/50";
  }
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "medium":
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5 text-primary" />;
  }
};

export function Announcements() {
  const { data: announcements = [], isLoading } = useDataFetching(
    ['announcements'],
    async () => {
      const data = await dashboardAPI.getCurrentAnnouncements();
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mt-4 space-y-4">
        {isLoading ? (
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Card
              key={announcement._id}
              className={`border-l-4 transition-colors ${getPriorityStyles(
                announcement.priority
              )}`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(announcement.priority)}
                      <h3 className="text-base sm:text-lg font-semibold line-clamp-2">
                        {announcement.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="whitespace-nowrap">
                        Until {formatDate(announcement.endDate)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap line-clamp-3 hover:line-clamp-none transition-all duration-200">
                    {announcement.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            message="There are no current announcements at this time."
            description="There are no current announcements at this time."
          />
        )}
      </div>
    </div>
  );
}
