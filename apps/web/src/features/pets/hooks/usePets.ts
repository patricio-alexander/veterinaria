import { supabase } from "@/lib/supabase/client";
import { Pets } from "@reservacion-veterinaria/types";
import { useQuery } from "@tanstack/react-query";

interface UserPetsProps {
  search?: string;
  page?: number;
  limit?: number;
  filterBySpecie?: number | null;
}

export const usePets = ({
  search,
  page = 1,
  limit = 10,
  filterBySpecie,
}: UserPetsProps) => {
  const fetchPets = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("patients")
      .select("*, species(name)", { count: "exact" })
      .range(from, to);

    if (search) {
      query = query.textSearch("name", search);
    }

    if (filterBySpecie) {
      query = query.eq("species", filterBySpecie);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const mappData = data.map<Pets>((pet) => ({
      id: pet.id,
      age: pet.age,
      name: pet.name,
      species: pet.species.name,
      weight: pet.weight,
      breed: pet.breed,
      sex: pet.sex,
      profilePhoto: pet.profile_photo,
    }));

    return {
      data: mappData,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    };
  };

  return useQuery({
    queryKey: ["pets", search, page, limit, filterBySpecie],
    queryFn: fetchPets,
  });
};
