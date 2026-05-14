import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editAppointment } from "../services/calendar.service";

export const useEditAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

