import { useQuery } from "@tanstack/react-query";
import { getOnerPet } from "../services/owners_pets.services";

export const useOwnerPet = (id: string) => {
  return useQuery({
    queryKey: ["owner_pet", id],
    queryFn: async () => await getOnerPet(id),
  });
};
