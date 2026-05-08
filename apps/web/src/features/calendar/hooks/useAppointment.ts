import { useQuery } from "@tanstack/react-query";
import { getAppointmnet } from "../services/calendar.service";

export const useAppointment = (appointmentId: number) => {
  return useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: async () => await getAppointmnet(appointmentId),
    enabled: appointmentId !== undefined,
  });
};
