import { StatusAppointment } from "@reservacion-veterinaria/types";

export const statusAppointment: Record<
  StatusAppointment,
  { bg: string; text: string }
> = {
  scheduled: {
    bg: "bg-blue-50 border-l-4 border-blue-500",
    text: "text-blue-700",
  },
  rescheduled: {
    bg: "bg-violet-50 border-l-4 border-violet-500",
    text: "text-violet-700",
  },
  cancelled: {
    bg: "bg-red-50 border-l-4 border-red-500",
    text: "text-red-700",
  },
  completed: {
    bg: "bg-green-50 border-l-4 border-green-500",
    text: "text-green-700",
  },
  pending: {
    bg: "bg-yellow-50 border-l-4 border-yellow-500",
    text: "text-yellow-700",
  },
  unavailable: {
    bg: "bg-slate-100 border-l-4 border-neutral-500",
    text: "text-neutral-700",
  },
};
