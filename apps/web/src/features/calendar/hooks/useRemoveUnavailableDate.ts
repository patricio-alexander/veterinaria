import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeUnavailableDate } from "../services/calendar.service";

export const useRemoveRemoveUnavailable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUnavailableDate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
