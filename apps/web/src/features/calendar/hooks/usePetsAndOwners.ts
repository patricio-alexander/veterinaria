import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useAllPets = () => {
  const fetchPets = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("id, name")
      .order("name");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  };

  return useQuery({
    queryKey: ["pets-all"],
    queryFn: fetchPets,
  });
};

export const useAllOwners = () => {
  const fetchOwners = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("role", "owner")
      .order("name");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  };

  return useQuery({
    queryKey: ["owners-all"],
    queryFn: fetchOwners,
  });
};