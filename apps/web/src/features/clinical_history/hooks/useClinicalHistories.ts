import { useQuery } from "@tanstack/react-query";
import { getClinicalHistories } from "../services/clinical_history.service";

export const useClinicalHistories = ({
  petId,
  search,
  page,
  limit,
}: {
  petId: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["clinical_histories"],
    queryFn: async () =>
      await getClinicalHistories({ petId, search, page, limit }),
  });
};
