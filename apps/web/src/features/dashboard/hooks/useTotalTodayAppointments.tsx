import { useQuery } from "@tanstack/react-query";
import { getTotalTodayAppointment } from "../services/dashboard.service";

export const useTotalTodayAppointments = () => {
  return useQuery({
    queryKey: ["total_appointments"],
    queryFn: getTotalTodayAppointment,
  });
};
