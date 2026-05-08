import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useVeterinarian = (id: string) => {
  const fetchOneVeterinarian = async () => {
    const { data, error } = await supabase
      .from("veterinarians")
      .select("*, profiles(*)")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  return useQuery({
    queryKey: ["veterinarian", id],
    queryFn: fetchOneVeterinarian,
  });
};
