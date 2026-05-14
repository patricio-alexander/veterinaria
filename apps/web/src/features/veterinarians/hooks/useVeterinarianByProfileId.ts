import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export const useVeterinarianIdByProfileId = (id: string) => {
  const [veterinarianId, setVeterinarianId] = useState<null | string>(null);

  useEffect(() => {
    const fetchVeterinarian = async () => {
      const { data } = await supabase
        .from("veterinarians")
        .select("id")
        .eq("profile_id", id)
        .single();

      setVeterinarianId(data?.id);
    };
    if (id) {
      fetchVeterinarian();
    }
  }, [id]);

  return veterinarianId;
};
