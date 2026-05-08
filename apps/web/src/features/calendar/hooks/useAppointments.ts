import { useQuery } from "@tanstack/react-query";
import { getAppointments } from "../services/calendar.service";

export const useAppointments = (veterinarianId: string) => {
  return useQuery({
    queryKey: ["appointments", veterinarianId],
    queryFn: async () => {
      const appointments = await getAppointments(veterinarianId);

      return appointments.map((app) => ({
        id: app.id,
        title: app.title,
        status: app.status,
        start: app.start_date_appointment,
        end: app.end_date_appointment,
      }));
    },
  });
};