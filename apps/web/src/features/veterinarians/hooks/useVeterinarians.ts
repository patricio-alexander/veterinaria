import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useVeterinarians = ({
  search = "",
  page = 1,
  limit = 10,
}: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const fetchVerinarians = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("veterinarians")
      .select("*, profiles(*)", { count: "exact" })
      .range(from, to);

    if (search) {
      query = query.textSearch("license_number", search);
    }
    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return { data, total: count, totalPages: Math.ceil((count || 0) / limit) };
  };

  return useQuery({
    queryKey: ["veterinarians", search, limit, page],
    queryFn: fetchVerinarians,
  });
};
