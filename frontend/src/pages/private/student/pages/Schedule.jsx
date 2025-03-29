import { useState } from "react";
import PrivateLayout from "../../PrivateLayout";
import Calendar from "../../../../components/custom-components/Calendar";
import { scheduleAPI } from "../../../../lib/api";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock4,
} from "lucide-react";
import SectionHeader from "@/components/custom-components/SectionHeader";
import EmptyState from "@/components/custom-components/EmptyState";
import { LoadingSpinner } from "@/components/custom-components/LoadingSpinner";
import { useDataFetching } from "@/hooks/useDataFetching";


const ScheduleItem = ({ event }) => (
  <div className="group rounded-lg border bg-background/50 hover:bg-accent/5 transition-all duration-200">
    <div className="p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary/70" />
          <span className="font-medium text-sm">{event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>#{event.orderId}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);
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

  const isToday = selectedDate?.toDateString() === new Date().toDateString();

  return (
    <PrivateLayout>
      <div className="space-y-6 pb-8">
        <SectionHeader
          title="Schedule"
          description="View your upcoming measurements"
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
                    <ScrollArea className="flex-1 -mr-6 pr-6">
                      <div className="space-y-2 pr-4">
                        {selectedEvents
                          .sort((a, b) => new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`))
                          .map((event) => (
                            <ScheduleItem key={event.orderId} event={event} />
                          ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <EmptyState
                      icon={CalendarIcon}
                      message="No appointments"
                      className="border-none py-12"
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
          <Card className="p-8 sm:p-12 text-center max-w-sm mx-auto shadow-sm">
            <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-primary/10" />
            <h3 className="text-base font-medium mb-1">No Schedule</h3>
            <p className="text-xs text-muted-foreground">
              Submit an order to get your schedule
            </p>
          </Card>
        )}
      </div>
    </PrivateLayout>
  );
}
