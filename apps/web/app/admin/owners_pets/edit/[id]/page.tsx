"use client";

import OwnerPetEditForm, {
  FormEditOwnerPets,
} from "@/src/features/owners_pets/components/OwnerPetEditForm";
import { useOwnerPet } from "@/src/features/owners_pets/hooks/useOnwerPet";
import { editOwnerPet } from "@/src/features/owners_pets/services/owners_pets.services";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditOwnerPetsPage() {
  const params = useParams<{ id: string }>();
  const { data: owner, isLoading } = useOwnerPet(params.id);

  const onSubmit = async (form: FormEditOwnerPets) => {
    try {
      await editOwnerPet(form, params.id);
      toast.success("Datos de dueño actaulizados con éxito");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <Loader />;
  }
  if (!owner) {
    return <div className="p-4">Dueño no encontrado</div>;
  }

  return <OwnerPetEditForm onSubmit={onSubmit} initialData={owner} />;
}
