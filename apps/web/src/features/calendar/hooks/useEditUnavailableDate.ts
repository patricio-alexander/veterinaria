import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { editUnavailableDate } from "../services/calendar.service";

export const useEditUnavailableDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editUnavailableDate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
