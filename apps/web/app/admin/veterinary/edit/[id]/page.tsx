"use client";

import { useParams, useRouter } from "next/navigation";
import { useVeterinarian } from "@/src/features/veterinarians/hooks/useVeterinarian";
import VeterinarianEditForm, {
  type VeterinarianEditFormData,
} from "@/src/features/veterinarians/components/VeterinarianEditForm";
import { toast } from "sonner";
import { Loader } from "lucide-react";

export default function EditVeterinaryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: veterinarian, isLoading } = useVeterinarian(id);

  const onSubmit = async (data: VeterinarianEditFormData) => {
    const formData = new FormData();

    for (const key in data) {
      const value = data[key as keyof VeterinarianEditFormData];
      if (value !== null && value !== undefined) {
        if (key === "photo" && typeof value === "string") {
          continue;
        }

        formData.append(key, value);
      }
    }

    const res = await fetch(`/api/users/update?id=${id}`, {
      method: "PUT",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error);
      throw new Error(result.error);
    }

    toast.success("Veterinario actualizado correctamente");
  };

  if (isLoading) {
    return <Loader />;
  }
  if (!veterinarian) {
    return <div className="p-4">Veterinario no encontrado</div>;
  }

  const initialData: Partial<VeterinarianEditFormData> = {
    name: veterinarian.profiles?.name ?? "",
    license_number: veterinarian.license_number ?? "",
    specialty: veterinarian.specialty ?? "",
    phone: veterinarian.phone ?? "",
    photo: veterinarian.profiles?.photo,
  };

  return <VeterinarianEditForm onSubmit={onSubmit} initialData={initialData} />;
}
