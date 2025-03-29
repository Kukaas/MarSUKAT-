import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Calendar({ events = [], onEventClick, onDateSelect }) {
  const [date, setDate] = useState(new Date());

  // Group events by date for easier lookup
  const eventsByDate = events.reduce((acc, event) => {
    const dateStr = event.start.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {});

  // Show today's events by default
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    const todayEvents = eventsByDate[todayStr] || [];

    if (onEventClick) {
      onEventClick(todayEvents);
    }
    if (onDateSelect) {
      onDateSelect(today);
    }
  }, [events]); // Run when events change

  const handleDayClick = (selectedDate) => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toDateString();
    const dayEvents = eventsByDate[dateStr] || [];

    if (onEventClick) {
      onEventClick(dayEvents);
    }
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
    setDate(selectedDate);
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={handleDayClick}
          className="w-full"
          modifiers={{
            booked: (date) => {
              const dateStr = date.toDateString();
              return !!eventsByDate[dateStr];
            },
          }}
          modifiersClassNames={{
            booked: cn(
              "bg-primary/30 dark:bg-primary/40 font-medium text-foreground dark:text-foreground",
              "aria-selected:bg-primary aria-selected:text-primary-foreground dark:aria-selected:text-primary-foreground"
            ),
            today:
              "bg-accent dark:bg-accent/50 text-accent-foreground dark:text-accent-foreground font-medium",
          }}
          classNames={{
            months: "w-full",
            month: "w-full",
            caption: "flex justify-between items-center h-12 px-2",
            caption_label: "text-lg font-medium",
            nav: "flex items-center gap-4",
            nav_button: cn(
              "h-8 w-8 hover:bg-accent/50 rounded-md flex items-center justify-center",
              "transition-colors duration-200"
            ),
            nav_button_previous: "",
            nav_button_next: "",
            table: "w-full border-collapse mt-1",
            head_row: "flex w-full",
            head_cell: cn(
              "text-muted-foreground font-normal text-[0.9rem]",
              "w-[calc(100%/7)] h-12",
              "flex items-center justify-center"
            ),
            row: "flex w-full mt-2",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              "w-[calc(100%/7)]",
              "h-14 sm:h-16 lg:h-18"
            ),
            day: cn(
              "h-full w-full p-0 font-normal aria-selected:opacity-100",
              "hover:bg-primary/40 hover:text-foreground dark:hover:bg-primary/50 dark:hover:text-foreground rounded-md transition-colors"
            ),
            day_selected: cn(
              "bg-primary text-primary-foreground",
              "hover:bg-primary hover:text-primary-foreground",
              "focus:bg-primary focus:text-primary-foreground",
              "dark:bg-primary dark:text-primary-foreground",
              "rounded-md font-medium"
            ),
            day_today: cn(
              "bg-accent dark:bg-accent/50",
              "text-accent-foreground dark:text-accent-foreground",
              "rounded-md",
              "aria-selected:bg-primary aria-selected:text-primary-foreground dark:aria-selected:text-primary-foreground"
            ),
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
          components={{
            DayContent: (props) => {
              const dateStr = props.date.toDateString();
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday =
                props.date.toDateString() === new Date().toDateString();
              const isSelected =
                props.date.toDateString() === date.toDateString();

              return (
                <div
                  className={cn(
                    "relative w-full h-full flex items-center justify-center",
                    isToday && "font-bold",
                    isSelected && "text-primary-foreground"
                  )}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="relative z-10 text-base sm:text-lg">
                      {props.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "absolute bottom-0.5 right-0.5 min-w-[16px] h-[16px] sm:min-w-[20px] sm:h-[20px]",
                          "p-0 flex items-center justify-center rounded-full",
                          "text-[10px] sm:text-[11px] font-medium",
                          "bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground",
                          "shadow-sm dark:shadow-primary/20",
                          isSelected && "bg-primary-foreground text-primary"
                        )}
                      >
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            },
          }}
        />
      </div>
    </div>
  );
}
