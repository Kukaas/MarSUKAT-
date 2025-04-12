import { useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import Calendar from "@/components/custom-components/Calendar";
import { scheduleAPI } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  GraduationCap,
  User,
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
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium">{event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="font-medium">{event.studentName}</span>
        </div>
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

          <div className="col-span-2 space-y-2">
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

export function Schedules() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  
  const { data: schedules = [], isLoading } = useDataFetching(
    ['schedules'],
    async () => {
      const data = await scheduleAPI.getAllSchedules();
      return data.map((schedule) => ({
        id: schedule.id,
        // Convert to proper Date object while handling timezone
        start: new Date(new Date(schedule.date).toLocaleString('en-US', {
          timeZone: 'Asia/Manila'
        })),
        time: schedule.time,
        department: schedule.department,
        studentNumber: schedule.studentNumber,
        studentName: schedule.name,
        orderId: schedule.orderId,
        status: schedule.status,
      }));
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
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

  const isToday = selectedDate?.toDateString() === new Date().toDateString();

  return (
    <PrivateLayout>
      <div className="space-y-6 pb-8">
        <SectionHeader
          title="Schedule"
          description="View all student measurement schedules"
        />

        {isLoading ? (
          <Card className="p-6">
            <LoadingSpinner message="Loading schedule..." />
          </Card>
        ) : schedules.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-[1.5fr,1fr] gap-6">
            <div className="min-w-0">
              <Card className="p-4 sm:p-6 shadow-sm h-full">
                <Calendar
                  events={schedules}
                  onEventClick={handleEventClick}
                  onDateSelect={setSelectedDate}
                />
              </Card>
            </div>

            <div className="min-w-0">
              <Card className="p-4 sm:p-6 shadow-sm md:sticky md:top-6 h-full flex flex-col">
                <h2 className="text-lg font-medium mb-6 flex items-baseline justify-between shrink-0">
                  <span>{selectedDate ? (isToday ? "Today" : formatDate(selectedDate, "long")) : "Today"}</span>
                  {selectedEvents.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {selectedEvents.length} scheduled
                    </span>
                  )}
                </h2>

                {selectedDate ? (
                  selectedEvents.length > 0 ? (
                    <ScrollArea className="max-h-[calc(100vh-480px)] -mr-6 pr-6">
                      <div className="space-y-2 pr-4">
                        {selectedEvents
                          .sort((a, b) => new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`))
                          .map((event) => {
                            const eventId = event.orderId || `${event.studentNumber}-${event.time}`;
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
                      message="No schedules found for this date"
                      className="border-none"
                    />
                  )
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-primary/10" />
                      <p className="text-xs text-muted-foreground">Select a date</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center shadow-sm">
            <CalendarIcon className="h-10 w-10 mx-auto mb-3 " />
            <h3 className="text-xl font-medium mb-1">No Schedule</h3>
            <p className="text-sm text-muted-foreground">
              No measurement schedules available
            </p>
          </Card>
        )}
      </div>
    </PrivateLayout>
  );
}
