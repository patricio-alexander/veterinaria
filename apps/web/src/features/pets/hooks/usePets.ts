import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface UserPetsProps {
  search?: string;
  page?: number;
  limit?: number;
}

export const usePets = ({ search, page = 1, limit = 10 }: UserPetsProps) => {
  const fetchPets = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("patients")
      .select("*", { count: "exact" })
      .range(from, to);

    if (search) {
      query = query.textSearch("name", search);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return { data, total: count, totalPages: Math.ceil((count || 0) / limit) };
  };

  return useQuery({
    queryKey: ["pets", search, page, limit],
    queryFn: fetchPets,
  });
};
