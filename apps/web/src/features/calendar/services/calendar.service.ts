import { supabase } from "@/lib/supabase/client";
import { StatusAppointment } from "@reservacion-veterinaria/types";

type Appointment = {
  status: StatusAppointment;
  title: string;
  description?: string;
  patient_id: string;
  veterinarian_id: string;
  reminder_sent: boolean;
  start_date_appointment: string;
  end_date_appointment: string;
  cost: number;
};

export const getAppointmnet = async (appointmentId: number) => {
  const { data, error } = await supabase
    .from("appointments")
    .select()
    .eq("id", appointmentId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    status: data.status,
    description: data.description,
    veterinarian: data.veterinarian_id,
    patient: data.patient_id,
    start: data.start_date_appointment,
    end: data.end_date_appointment,
    cost: data.cost,
  };
};

export const getAppointments = async (veterinarianId: string) => {
  const { data, error } = await supabase
    .from("appointments")
    .select()
    .eq("veterinarian_id", veterinarianId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const changeStatusAppointment = async ({
  appointmentId,
  status,
}: {
  appointmentId: number;
  status: StatusAppointment;
}) => {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);

  if (error) {
    throw new Error(error.message);
  }
};

export const editAppointment = async ({
  data,
  id,
}: {
  data: Appointment;
  id: number;
}) => {
  const {
    status,
    patient_id,
    veterinarian_id,
    title,
    description,
    reminder_sent,
    start_date_appointment,
    end_date_appointment,
    cost,
  } = data;

  const { error } = await supabase
    .from("appointments")
    .update({
      title,
      description,
      status,
      patient_id,
      veterinarian_id,
      reminder_sent,
      start_date_appointment,
      end_date_appointment,
      cost,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const addAppointment = async (data: Appointment) => {
  const {
    status,
    patient_id,
    veterinarian_id,
    title,
    description,
    reminder_sent,
    start_date_appointment,
    end_date_appointment,
    cost,
  } = data;

  const { error } = await supabase.from("appointments").insert({
    title,
    description,
    status,
    patient_id,
    veterinarian_id,
    reminder_sent,
    start_date_appointment,
    end_date_appointment,
    cost,
  });

  if (error) {
    throw new Error(error.message);
  }
};
