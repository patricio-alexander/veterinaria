import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../services/calendar.service";

export const useEvents = (veterinarianId: string) => {
  return useQuery({
    queryKey: ["events", veterinarianId],
    queryFn: async () => await getEvents(veterinarianId),
  });
};
