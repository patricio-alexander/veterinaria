import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAppointment } from "../services/calendar.service";

export const useRemoveAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
