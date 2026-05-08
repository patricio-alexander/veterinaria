import { supabase } from "@/lib/supabase/client";
import { FormOwnerPets } from "@/src/features/owners_pets/components/OwnerPetForm";
import { FormEditOwnerPets } from "../components/OwnerPetEditForm";

export const getOnerPet = async (id: string) => {
  const { data, error } = await supabase
    .from("owner_patients")
    .select("phone, address, profiles(name)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { phone, address, profiles } = data;

  return { phone, address, name: profiles?.name };
};

export const editOwnerPet = async (owner: FormEditOwnerPets, id: string) => {
  const request = await fetch(`/api/owners_pets/update?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(owner),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await request.json();
  if (!request.ok) {
    throw new Error(response.error);
  }
};

export const addOwnerPet = async (owner: FormOwnerPets) => {
  const request = await fetch("/api/owners_pets/create", {
    method: "POST",
    body: JSON.stringify(owner),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await request.json();

  if (!request.ok) {
    throw new Error(response.error);
  }
};
