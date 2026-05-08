import { useQuery } from "@tanstack/react-query";
import { getPet } from "../services/pets.service";

export const usePet = (id: string) => {
  return useQuery({
    queryKey: ["pet", id],
    queryFn: async () => await getPet(id),
  });
};
