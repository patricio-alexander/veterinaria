import { useQuery } from "@tanstack/react-query";
import { getClinicalHistory } from "../services/clinical_history.service";

export const useClinicalHistory = (id: string) => {
  return useQuery({
    queryKey: ["clinical_history", id],
    queryFn: async () => await getClinicalHistory(id),
  });
};
