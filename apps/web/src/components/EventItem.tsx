import { EventContentArg } from "@fullcalendar/core/index.js";
import { Chip } from "@heroui/react";
import {
  AppointmentType,
  StatusAppointment,
} from "@reservacion-veterinaria/types";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Clock } from "lucide-react";
import { appointmentTypes } from "../constants/appointment-type";
import { statusAppointment } from "../constants/appointment-status";

export default function EventItem(eventInfo: EventContentArg) {
  const startDate = eventInfo.event.start;
  const endDate = eventInfo.event.end;

  if (!startDate) return null;

  const hourStart = format(startDate, "h:mm a", { locale: es });
  const hourEnd = endDate ? format(endDate, "h:mm a", { locale: es }) : null;

  const timeDisplay = hourEnd ? `${hourStart} - ${hourEnd}` : hourStart;

  const { bg, text } =
    statusAppointment[
      eventInfo.event.extendedProps?.status as StatusAppointment
    ];

  const badge =
    appointmentTypes[eventInfo.event.extendedProps?.type as AppointmentType];

  return (
    <div className={`w-full p-1 ${bg} rounded-r-md cursor-pointer`}>
      <div className={`flex items-center gap-1 ${text} text-xs font-medium`}>
        <Clock size={12} />
        <span>{timeDisplay}</span>
      </div>

      <div className={`text-sm font-semibold ${text} truncate`}>
        {eventInfo.event.title}
      </div>
      <Chip variant="soft" color={badge?.color ?? "default"}>
        {badge?.label ?? "Ninguno"}
      </Chip>
    </div>
  );
}
