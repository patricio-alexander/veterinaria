import { supabase } from "@/lib/supabase/client";
import { object } from "zod";

const fieldMap = {
  reason: "reason",
  diagnosis: "diagnosis",
  treatment: "treatment",
  medications: "prescribed_medications",
  attachments: "attachments",
};

type Attachment = {
  file: string;
  path: string;
};

type ClinicalHistory = {
  reason?: string;
  diagnosis?: string;
  medications?: string;
  treatment?: string;
  attachments?: Attachment[];
};

export const getClinicalHistoryFiles = async (id: string) => {
  const { data, error } = await supabase
    .from("clinical_histories")
    .select("attachments")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getClinicalHistory = async (id: string) => {
  const { data, error } = await supabase
    .from("clinical_histories")
    .select(
      "id, reason, diagnosis, treatment, prescribed_medications, attachments",
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getClinicalHistories = async ({
  petId,
  search = "",
  page = 1,
  limit = 10,
}: {
  petId: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("clinical_histories")
    .select("*", { count: "exact" })
    .range(from, to)
    .eq("patient_id", petId);

  if (search) {
    query = query.textSearch("reason", search);
  }
  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { data, total: count, totalPages: Math.ceil((count || 0) / limit) };
};

export const addClinicalHistory = async ({
  data,
  veterinarianId,
  petId,
}: {
  data: ClinicalHistory;
  veterinarianId: string;
  petId: string;
}) => {
  const { reason, diagnosis, treatment, medications } = data;

  const { data: insert, error } = await supabase
    .from("clinical_histories")
    .insert({
      reason,
      diagnosis,
      treatment,
      prescribed_medications: medications,
      responsible_veterinarian_id: veterinarianId,
      patient_id: petId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return insert;
};

export const editClinicalHistory = async ({
  data,
  id,
}: {
  data: ClinicalHistory;
  id: string;
}) => {
  const values = Object.fromEntries(
    Object.entries(fieldMap)
      .filter(([key]) => data[key as keyof ClinicalHistory] !== undefined)
      .map(([key, column]) => [key, data[column as keyof ClinicalHistory]]),
  );

  const { error } = await supabase
    .from("clinical_histories")
    .update(values)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};
