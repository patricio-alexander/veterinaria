import { useQuery } from "@tanstack/react-query";
import { getTotalCustomers } from "../services/dashboard.service";

export const useTotalCustomers = () => {
  return useQuery({
    queryKey: ["total_customers"],
    queryFn: getTotalCustomers,
  });
};
