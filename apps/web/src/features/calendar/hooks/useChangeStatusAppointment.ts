import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeStatusAppointment } from "../services/calendar.service";
import { StatusAppointment } from "@reservacion-veterinaria/types";

export const useChangeStatusAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      status,
    }: {
      appointmentId: number;
      status: StatusAppointment;
    }) => changeStatusAppointment({ appointmentId, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

