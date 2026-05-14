"use client";

import { supabase } from "@/lib/supabase/client";
import Loader from "@/src/components/Loader";
import ClinicalHistoryForm, {
  type FormClinicalHistory,
} from "@/src/features/clinical_history/components/ClinicalHistoryForm";
import { useClinicalHistory } from "@/src/features/clinical_history/hooks/useClinicalHistory";
import { editClinicalHistory } from "@/src/features/clinical_history/services/clinical_history.service";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditClinicalHistoryPage() {
  const params = useParams<{ idHistory: string; petId: string }>();
  const router = useRouter();

  const { data: clinicalHistory, isLoading } = useClinicalHistory(
    params.idHistory,
  );

  if (isLoading) {
    return <Loader />;
  }

  const initialData = {
    reason: clinicalHistory?.reason,
    diagnosis: clinicalHistory?.diagnosis,
    treatment: clinicalHistory?.treatment,
    medications: clinicalHistory?.prescribed_medications,
    attachments: clinicalHistory?.attachments.map((f: any) => ({
      type: "existing" as const,
      name: f.name,
      path: f.path,
    })),
  };

  const onSubmit = async (form: FormClinicalHistory) => {
    try {
      const uploadFiles = form.attachments.filter((f) => f?.type === "new");

      const uploadPromise = uploadFiles.map(async (file) => {
        if (file?.type === "new") {
          const safeFileName = file.file.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w.-]/g, "_");

          const { data, error } = await supabase.storage
            .from("pet-medical-files")
            .upload(
              `${params.petId}/medical-history/${params.idHistory}/${safeFileName}`,
              file.file,
              { upsert: true },
            );

          if (error) {
            console.error("Error uploading:", file.file.name, error);
            return { file: file.file.name, success: false, error };
          }

          return { file: file.file.name, success: true, data, path: data.path };
        }
      });

      const uploadAll = await Promise.all(uploadPromise);

      const mapped = uploadAll
        .filter((f) => f?.success)
        .filter((f) =>
          clinicalHistory?.attachments?.every((a: any) => a?.name !== f?.file),
        )
        .map((f) => ({
          path: f?.path,
          name: f?.file,
        }));

      const data = {
        reason: form.reason,
        diagnosis: form.diagnosis,
        medications: form.medications,
        treatment: form.treatment,
        attachments: [...clinicalHistory?.attachments, ...mapped],
      };

      await editClinicalHistory({ data, id: params.idHistory });
      toast.success("Historial editado con éxito");
    } catch (error) {
      toast.error("Ups ocurrió un eror");
    } finally {
      router.back();
    }
  };

  return (
    <ClinicalHistoryForm
      onSubmit={onSubmit}
      initialData={initialData as FormClinicalHistory}
    />
  );
}
