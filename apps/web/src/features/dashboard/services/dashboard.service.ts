import { supabase } from "@/lib/supabase/client";
import { endOfMonth, startOfMonth } from "date-fns";

export const getTotalTodayAppointment = async () => {
  const startDay = new Date();
  startDay.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const { count, error } = await supabase
    .from("appointments")
    .select("*", { count: "exact" })
    .gte("start_date_appointment", startDay.toISOString())
    .lte("end_date_appointment", endDate.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  return { count };
};

export const getMonthlyIncome = async () => {
  const date = new Date();
  const start = startOfMonth(date).toISOString();
  const end = endOfMonth(date).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("cost")
    .eq("status", "completed")
    .gte("start_date_appointment", start)
    .lte("end_date_appointment", end);

  const total = data?.reduce((acc, curr) => acc + curr.cost, 0);

  return total ?? 0;
};

export const getTotalCustomers = async () => {
  const { count, error } = await supabase
    .from("owner_patients")
    .select("*", { count: "exact" });

  if (error) {
    throw new Error(error.message);
  }

  return count;
};

export const getTotalPets = async () => {
  const { count, error } = await supabase
    .from("patients")
    .select("*", { count: "exact" });

  if (error) {
    throw new Error(error.message);
  }

  return count;
};
