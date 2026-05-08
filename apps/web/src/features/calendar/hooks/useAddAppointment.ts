import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAppointment } from "../services/calendar.service";

export const useAddAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAppointment,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};