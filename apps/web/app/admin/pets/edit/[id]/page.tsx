"use client";
import Loader from "@/src/components/Loader";
import PetsForm, {
  PetsFormData,
} from "@/src/features/pets/components/PetsForm";
import { usePet } from "@/src/features/pets/hooks/usePet";
import { editPet } from "@/src/features/pets/services/pets.service";
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

  console.log(data);

  const initialData: PetsFormData = {
    color: data.color,
    sterilized: data.sterilized,
    name: data.name,
    owner: data.owner.id,
    sex: data.sex,
    species: data.species.id,
    age: data.age,
    breed: data.breed,
    weight: data.weight,
    photo: data.photo,
  };

  return <PetsForm onSubmit={onSubmit} initialData={initialData} />;
}
