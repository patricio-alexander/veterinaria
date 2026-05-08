import { useQuery } from "@tanstack/react-query";
import { getMonthlyIncome } from "../services/dashboard.service";

export const useMontlyIncome = () => {
  return useQuery({
    queryKey: ["monthly_income"],
    queryFn: async () => await getMonthlyIncome(),
  });
};
