"use client";

import OwnerPetForm, {
  type FormOwnerPets,
} from "@/src/features/owners_pets/components/OwnerPetForm";
import { addOwnerPet } from "@/src/features/owners_pets/services/owners_pets.services";
import { toast } from "sonner";

export default function NewOwnerPetsPage() {
  const onSubmit = async (form: FormOwnerPets) => {
    try {
      await addOwnerPet(form);
      toast.success("Dueño agregado con éxito");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return <OwnerPetForm onSubmit={onSubmit} />;
}
