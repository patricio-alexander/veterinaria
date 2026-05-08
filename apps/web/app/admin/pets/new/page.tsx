"use client";

import { supabase } from "@/lib/supabase/client";
import PetsForm, {
  type PetsFormData,
} from "@/src/features/pets/components/PetsForm";
import { addPet } from "@/src/features/pets/services/pets.service";
import { toast } from "sonner";

export default function NewPetsPage() {
  const onSubtmit = async (form: PetsFormData) => {
    try {
      await addPet(form);
      toast.success("Mascota agregada con éxito");
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  return <PetsForm onSubmit={onSubtmit} />;
}
