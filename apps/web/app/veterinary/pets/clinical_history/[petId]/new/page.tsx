"use client";

import { supabase } from "@/lib/supabase/client";
import ClinicalHistoryForm, {
  FormClinicalHistory,
} from "@/src/features/clinical_history/components/ClinicalHistoryForm";
import { addClinicalHistory } from "@/src/features/clinical_history/services/clinical_history.service";
import { useVeterinarianIdByProfileId } from "@/src/features/veterinarians/hooks/useVeterinarianByProfileId";
import { useAuthStore } from "@/src/store/auth.store";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function NewPetClinicalHistory() {
  const params = useParams<{ petId: string }>();
  const { user } = useAuthStore();
  const veterinarianId = useVeterinarianIdByProfileId(user?.id as string);

  const onSubmit = async (form: FormClinicalHistory) => {
    try {
      const { diagnosis, reason, medications, treatment } = form;

      const clinicalHistory = await addClinicalHistory({
        data: {
          diagnosis,
          reason,
          medications,
          treatment,
        },
        veterinarianId,
        petId: params.petId,
      });

      const uploadPromise = (form?.attachments || []).map(async (file) => {
        if (file?.type === "new") {
          const safeFileName = file.file.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w.-]/g, "_");
          const { data, error } = await supabase.storage
            .from("pet-medical-files")
            .upload(
              `${params.petId}/medical-history/${clinicalHistory?.id}/${safeFileName}`,
              file.file,
            );

          if (error) {
            console.error("Error uploading:", file.file.name, error);
            return { file: file.file.name, success: false, error };
          }

          return { file: file.file.name, success: true, data, path: data.path };
        }
      });

      const uploadAll = await Promise.all(uploadPromise);

      const data = {
        attachments: uploadAll
          .filter((f) => f?.success)
          .map((f) => ({
            path: f?.path,
            name: f?.file,
          })),
      };

      await supabase
        .from("clinical_histories")
        .update(data)
        .eq("id", clinicalHistory.id);

      toast.success("Historial clinico agregado con éxito");
    } catch (error) {
      toast.error("Ups ocurrio un error");
    }
  };

  return <ClinicalHistoryForm onSubmit={onSubmit} />;
}
