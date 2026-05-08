import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

type useOwnerPetsProps = {
  search?: string;
  page?: number;
  limit?: number;
};

export const useOwnerPets = ({
  search = "",
  page = 1,
  limit = 10,
}: useOwnerPetsProps) => {
  const fetchOwnerPets = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("owner_patients")
      .select("*, profiles(*)", { count: "exact" })
      .range(from, to);

    if (search) {
      query = query.textSearch("profiles.name", search);
    }
    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    };
  };

  return useQuery({
    queryKey: ["owner_pets", search, limit, page],
    queryFn: fetchOwnerPets,
  });
};
