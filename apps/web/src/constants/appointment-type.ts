import { Chip } from "@heroui/react";
import { AppointmentType } from "@reservacion-veterinaria/types";
import { ComponentProps } from "react";

type ColorChips = ComponentProps<typeof Chip>["color"];

export const appointmentTypes: Record<
  AppointmentType,
  { color: ColorChips; label: string }
> = {
  emergency: {
    color: "danger",
    label: "Emergencia",
  },
  general_consultation: {
    color: "accent",
    label: "Consulta general",
  },
  pet_grooming: {
    color: "accent",
    label: "Estética",
  },
  surgery: {
    color: "warning",
    label: "Cirugía",
  },
  vaccination: {
    color: "default",
    label: "Vacunación",
  },
};
