import { useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import Calendar from "../../../../components/custom-components/Calendar";
import { scheduleAPI } from "../../../../lib/api";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  GraduationCap,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import SectionHeader from "@/components/custom-components/SectionHeader";
import EmptyState from "@/components/custom-components/EmptyState";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/custom-components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useDataFetching } from "@/hooks/useDataFetching";

const ScheduleItem = ({ event, isExpanded, onToggle }) => (
  <div className="overflow-hidden bg-background rounded-lg border transition-all duration-200 hover:shadow-md">
    <Button
      variant="ghost"
      className={cn(
        "w-full px-4 py-3 flex items-center justify-between transition-colors",
        "hover:bg-accent/50",
        isExpanded && "bg-accent/30 hover:bg-accent/30"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <span className="font-medium">{event.time}</span>
      </div>
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>

    {isExpanded && (
      <div className="p-4 space-y-4 bg-accent/5 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm">Date</span>
            </div>
            <p className="font-medium pl-6">
              {formatDate(event.start, "long")}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Department</span>
            </div>
            <p className="font-medium pl-6">{event.department}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm">Student Number</span>
            </div>
            <p className="font-medium pl-6">{event.studentNumber}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Order ID</span>
            </div>
            <p className="font-medium pl-6">{event.orderId}</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const { user } = useAuth();

  // Fetch schedule with React Query
  const { data: schedules = [], isLoading } = useDataFetching(
    ['schedule', user?._id],
    async () => {
      if (!user?._id) return [];
      const data = await scheduleAPI.getMySchedule(user._id);
      
      if (!data.length) return [];

      return data.map((schedule) => ({
        id: schedule.id,
        title: `Measurement Schedule`,
        start: new Date(schedule.date),
        time: schedule.time,
        department: schedule.department,
        studentNumber: schedule.studentNumber,
        status: schedule.status,
        orderId: schedule.orderId,
      }));
    },
    {
      enabled: !!user?._id,
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    }
  );

  const handleEventClick = (events) => {
    setSelectedEvents(events);
    setSelectedDate(events.length > 0 ? events[0].start : null);
  };

  const toggleEventDetails = (eventId) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Measurement Schedule"
          description="View your upcoming measurement schedules"
        />

        {isLoading ? (
          <Card className="p-6">
            <LoadingSpinner message="Loading Schedules" />
          </Card>
        ) : schedules.length > 0 ? (
          <div className="grid lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-6">
            <div className="min-w-0">
              <Card className="p-4 sm:p-6">
                <Calendar
                  events={schedules}
                  onEventClick={handleEventClick}
                  onDateSelect={(date) => setSelectedDate(date)}
                />
              </Card>
            </div>

            <div className="min-w-0">
              <Card className="p-4 sm:p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-6">
                  {selectedDate ? (
                    <>
                      {selectedDate.toDateString() === new Date().toDateString()
                        ? "Today's Schedules"
                        : `Schedules for ${formatDate(selectedDate, "long")}`}
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedEvents.length} schedule
                        {selectedEvents.length !== 1 ? "s" : ""} found
                      </p>
                    </>
                  ) : (
                    "Today's Schedules"
                  )}
                </h2>

                {selectedDate ? (
                  selectedEvents.length > 0 ? (
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-3 pr-4">
                        {selectedEvents
                          .sort((a, b) => {
                            const timeA = new Date(`1970/01/01 ${a.time}`);
                            const timeB = new Date(`1970/01/01 ${b.time}`);
                            return timeA - timeB;
                          })
                          .map((event) => {
                            const eventId =
                              event.orderId ||
                              `${event.studentNumber}-${event.time}`;
                            const isExpanded = expandedEvents.has(eventId);

                            return (
                              <ScheduleItem
                                key={eventId}
                                event={event}
                                isExpanded={isExpanded}
                                onToggle={() => toggleEventDetails(eventId)}
                              />
                            );
                          })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <EmptyState
                      icon={CalendarX}
                      message="You don't have any schedules on this date"
                      className="border-none"
                    />
                  )
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>
                      Select a date from the calendar to view schedule details
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Schedule Found</h3>
            <p className="text-muted-foreground">
              Please submit an order first to get your measurement schedule.
            </p>
          </Card>
        )}
      </div>
    </PrivateLayout>
  );
}
