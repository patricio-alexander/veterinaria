"use client";
import PetsForm, {
  PetsFormData,
} from "@/src/features/pets/components/PetsForm";
import { usePet } from "@/src/features/pets/hooks/usePet";
import { editPet } from "@/src/features/pets/services/pets.service";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditPetPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = usePet(params.id);

  const onSubmit = async (form: PetsFormData) => {
    try {
      await editPet(form, params.id);
      toast.success("Datos de la mascota actualizados con éxito");
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return <div className="p-4">Mascota no encontrada</div>;
  }

  return <PetsForm onSubmit={onSubmit} initialData={data} />;
}
