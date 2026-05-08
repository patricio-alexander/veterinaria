"use client";

import VeterinarianForm, {
  type VeterinarianFormData,
} from "@/src/features/veterinarians/components/VeterinarianForm";
import { addVeterinarian } from "@/src/features/veterinarians/services/veterinarian.service";
import { toast } from "sonner";

export default function NewVeterinaryPage() {
  const onSubmit = async (data: VeterinarianFormData) => {
    try {
      await addVeterinarian(data);
      toast.success("Veterinario agregado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return <VeterinarianForm onSubmit={onSubmit} />;
}
