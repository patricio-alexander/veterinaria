import { useQuery } from "@tanstack/react-query";
import { getClinicalHistoryFiles } from "../services/clinical_history.service";

export const useClinicalHistoryFiles = (id: string) => {
  return useQuery({
    queryKey: ["clinical_files", id],
    queryFn: () => getClinicalHistoryFiles(id),
    enabled: !!id,
  });
};
