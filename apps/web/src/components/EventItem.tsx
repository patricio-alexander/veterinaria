import { EventContentArg } from "@fullcalendar/core/index.js";
import { StatusAppointment } from "@reservacion-veterinaria/types";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Clock } from "lucide-react";

export default function EventItem(eventInfo: EventContentArg) {
  const startDate = eventInfo.event.start;
  const endDate = eventInfo.event.end;

  if (!startDate) return null;

  const hourStart = format(startDate, "h:mm a", { locale: es });
  const hourEnd = endDate ? format(endDate, "h:mm a", { locale: es }) : null;

  const timeDisplay = hourEnd ? `${hourStart} - ${hourEnd}` : hourStart;

  const color: Record<StatusAppointment, { bg: string; text: string }> = {
    scheduled: {
      bg: "bg-blue-50 border-l-4 border-blue-500",
      text: "text-blue-700",
    },
    rescheduled: {
      bg: "bg-violet-50 border-l-4 border-violet-500",
      text: "text-violet-700",
    },
    cancelled: {
      bg: "bg-red-50 border-l-4 border-red-500",
      text: "text-red-700",
    },
    completed: {
      bg: "bg-green-50 border-l-4 border-green-500",
      text: "text-green-700",
    },
    pending: {
      bg: "bg-yellow-50 border-l-4 border-yellow-500",
      text: "text-yellow-700",
    },
  };

  const { bg, text } =
    color[eventInfo.event.extendedProps?.status as StatusAppointment];

  return (
    <div className={`w-full p-1 ${bg} rounded-r-md`}>
      <div className={`flex items-center gap-1 ${text} text-xs font-medium`}>
        <Clock size={12} />
        <span>{timeDisplay}</span>
      </div>
      <div className={`text-sm font-semibold ${text} truncate`}>
        {eventInfo.event.title}
      </div>
    </div>
  );
}
