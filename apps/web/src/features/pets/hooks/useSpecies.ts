import { useQuery } from "@tanstack/react-query";
import { getSpecies } from "../services/pets.service";

export const useSpecies = () => {
  return useQuery({
    queryKey: ["species"],
    queryFn: getSpecies,
  });
};
