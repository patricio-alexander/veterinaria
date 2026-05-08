import { useQuery } from "@tanstack/react-query";
import { getTotalPets } from "../services/dashboard.service";

export const useTotalPets = () => {
  return useQuery({
    queryKey: ["total_pets"],
    queryFn: getTotalPets,
  });
};
