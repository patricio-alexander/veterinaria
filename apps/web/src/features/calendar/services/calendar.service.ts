import { supabase } from "@/lib/supabase/client";
import { StatusAppointment } from "@reservacion-veterinaria/types";

type UnavailableDates = {
  reason: string;
  startDate: string;
  endDate: string;
};

type Appointment = {
  status: StatusAppointment;
  title: string;
  description?: string;
  patientId: string;
  veterinarianId: string;
  startDateAppointment: string;
  endDateAppointment: string;
  cost: number;
  type: string;
};

export const removeUnavailableDate = async (id: string) => {
  const { error } = await supabase
    .from("unavailable_dates")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const removeAppointment = async (id: string) => {
  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const checkUnavailable = async (date: string) => {
  const { data, error } = await supabase
    .from("unavailable_dates")
    .select()
    .lte("start_date", date)
    .gte("end_date", date);
  if (error) {
    throw new Error(error.message);
  }

  return !!data.length;
};

export const getOneUnavailableDate = async (id: number) => {
  const { data, error } = await supabase
    .from("unavailable_dates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return {
    id: data.id,
    startDate: data.start_date,
    endDate: data.end_date,
    reason: data.reason,
    veterinarianId: data.veterinarian_id,
  };
};

export const editUnavailableDate = async ({
  data,
  id,
}: {
  data: UnavailableDates;
  id: number;
}) => {
  const { error } = await supabase
    .from("unavailable_dates")
    .update({
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const getUnavailablesDates = async (veterinarianId: string) => {
  const { data, error } = await supabase
    .from("unavailable_dates")
    .select("")
    .eq("veterinarian_id", veterinarianId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const addUnavailableDates = async (data: {
  start: string;
  end: string;
  veterinarianId: string;
  reason: string;
}) => {
  const { error } = await supabase.from("unavailable_dates").insert({
    start_date: data.start,
    end_date: data.end,
    veterinarian_id: data.veterinarianId,
    reason: data.reason,
  });

  if (error) {
    throw new Error(error.message);
  }
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
    type: data.type,
  };
};

export const getEvents = async (veterinarianId: string) => {
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select()
    .eq("veterinarian_id", veterinarianId);

  const { data: unavailableDates, error: unavailableDatesError } =
    await supabase
      .from("unavailable_dates")
      .select()
      .eq("veterinarian_id", veterinarianId);

  if (error) {
    throw new Error(error.message);
  }

  if (unavailableDatesError) {
    throw new Error(unavailableDatesError.message);
  }

  return [
    ...appointments.map((app) => ({
      id: app.id,
      title: app.title,
      status: app.status,
      start: app.start_date_appointment,
      end: app.end_date_appointment,
      type: app.type,
    })),

    ...unavailableDates.map((app) => ({
      id: app.id,
      title: "No disponible",
      status: "unavailable",
      start: app.start_date,
      end: app.end_date,
      type: null,
    })),
  ];
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
    patientId,
    veterinarianId,
    title,
    description,
    startDateAppointment,
    endDateAppointment,
    cost,
    type,
  } = data;
  const { error } = await supabase
    .from("appointments")
    .update({
      title,
      description,
      status,
      patient_id: patientId,
      veterinarian_id: veterinarianId,
      start_date_appointment: startDateAppointment,
      end_date_appointment: endDateAppointment,
      cost,
      type,
    })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
};

export const addAppointment = async (data: Appointment) => {
  const {
    status,
    patientId,
    veterinarianId,
    title,
    description,
    startDateAppointment,
    endDateAppointment,
    cost,
    type,
  } = data;
  const { error } = await supabase.from("appointments").insert({
    title,
    description,
    status,
    patient_id: patientId,
    veterinarian_id: veterinarianId,
    start_date_appointment: startDateAppointment,
    end_date_appointment: endDateAppointment,
    cost,
    type,
  });
  if (error) {
    throw new Error(error.message);
  }
};
