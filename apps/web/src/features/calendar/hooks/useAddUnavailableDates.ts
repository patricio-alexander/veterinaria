import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUnavailableDates } from "../services/calendar.service";

export const useAddUnavailableDates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUnavailableDates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
