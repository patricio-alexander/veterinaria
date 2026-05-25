import { PageContainer } from "@/src/components/PageContainer";

import { useVeterinarian } from "../../veterinarians/hooks/useVeterinarian";
import { useParams } from "next/navigation";
import { Mail } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction"; // needed for dayClick
import { useState } from "react";
import { Card, Avatar } from "@heroui/react";

import { checkUnavailable, getAppointmnet } from "../services/calendar.service";
import { toast } from "sonner";
import { useEvents } from "../hooks/useEvents";
import { EventClickArg } from "@fullcalendar/core/index.js";
import { useAddAppointment } from "../hooks/useAddAppointment";
import { useEditAppointment } from "../hooks/useEditAppointment";
import EventItem from "@/src/components/EventItem";
import { StatusAppointment } from "@reservacion-veterinaria/types";
import { useChangeStatusAppointment } from "../hooks/useChangeStatusAppointment";
import esLocale from "@fullcalendar/core/locales/es";
import BackButton from "@/src/components/BackButton";
import FormModalAppointment, {
  Appointment,
  AppointmentOption,
} from "./FormModalAppointment";

const APPOINTMENTS_OPTIONS: AppointmentOption[] = [
  {
    id: 1,
    key: "general_consultation",
    value: "Consulta general",
  },
  {
    id: 2,
    key: "vaccination",
    value: "Vacunación",
  },
  {
    id: 3,
    key: "pet_grooming",
    value: "Estética",
  },
  {
    id: 4,
    key: "surgery",
    value: "Cirugía",
  },
  {
    id: 5,
    key: "emergency",
    value: "Urgencia",
  },
];

export default function AdminCalendar() {
  const params = useParams<{ id: string }>();
  const { data: veterinarian, isLoading } = useVeterinarian(params.id);
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const addAppointment = useAddAppointment();
  const editAppointment = useEditAppointment();
  const changeStatusAppointment = useChangeStatusAppointment();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const [date, setDate] = useState(new Date());

  const { data: events, isLoading: isLoadingEvents } = useEvents(params.id);

  const onDateClick = async (arg: DateClickArg) => {
    const unavailable = await checkUnavailable(arg.date.toISOString());
    if (unavailable) {
      toast.warning("Esta fecha no esta disponible");

      return;
    }

    setIsOpen(true);
    setDate(arg.date);
  };

  const onSubmit = async (form: Appointment) => {
    setIsOpen(false);
    setIsEdit(false);
    if (!isEdit) {
      addAppointment.mutate(
        {
          status: "scheduled",
          title: form.title,
          description: form.description,
          patientId: form.patient,
          veterinarianId: params.id,
          startDateAppointment: form.start,
          endDateAppointment: form.end,
          cost: form.cost,
          type: form.type,
        },
        {
          onSuccess: () => {
            setAppointment(null);

            return toast.success("Cita agendada con éxito");
          },
          onError: (error) => {
            console.error(error.message);
          },
        },
      );
      return;
    }
    editAppointment.mutate(
      {
        data: {
          status: "rescheduled",
          title: form.title,
          description: form.description,
          patientId: form.patient,
          veterinarianId: params.id,
          startDateAppointment: form.start,
          endDateAppointment: form.end,
          cost: form.cost,
          type: form.type,
        },
        id: appointmentId as number,
      },

      {
        onSuccess: () => {
          setAppointment(null);

          return toast.success("Cita  editada con éxito");
        },
        onError: (error) => {
          console.error(error.message);
        },
      },
    );
  };

  const onEventClick = async (e: EventClickArg) => {
    if (e.event.extendedProps.status === "unavailable") {
      return;
    }

    setIsEdit(true);
    const id = Number(e.event.id);
    setAppointmentId(id);
    setIsOpen(true);
    const appointment = await getAppointmnet(id);

    setAppointment({
      ...appointment,
      status: e.event.extendedProps.status as StatusAppointment,
    });
  };

  return (
    <PageContainer>
      <BackButton />
      <div style={{ height: 600, width: "100%" }}>
        <Card className="mb-4 p-4 bg-default-100">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <Avatar.Image src={veterinarian?.profiles.photo} />
              <Avatar.Fallback>
                {veterinarian?.profiles.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </Avatar.Fallback>
            </Avatar>
            <div>
              <p className="text-small text-default-500">Veterinario</p>
              <p className="text-lg font-semibold">
                {veterinarian?.profiles.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 ml-14">
            <Mail size={16} className="text-default-400" />
            <span className="text-medium text-default-600">
              {veterinarian?.profiles?.email}
            </span>
          </div>
        </Card>
        <FormModalAppointment
          appointmentOptions={APPOINTMENTS_OPTIONS}
          isOpen={isOpen}
          onReactive={() => {
            changeStatusAppointment.mutate(
              { status: "scheduled", appointmentId },
              {
                onSuccess: () => {
                  toast.success("Cita reactivada con éxito");
                },
              },
            );
          }}
          onCancel={() => {
            changeStatusAppointment.mutate(
              { status: "cancelled", appointmentId },
              {
                onSuccess: () => {
                  toast.success("Cita cancelda con éxito");
                },
              },
            );
          }}
          close={() => {
            setAppointment(null);
            setIsOpen(false);
          }}
          date={date.toISOString()}
          onSubmit={onSubmit}
          appointment={appointment}
        />
        <FullCalendar
          headerToolbar={{
            start: "dayGrid,dayGridWeek,dayGridDay",
          }}
          locales={[esLocale]}
          plugins={[dayGridPlugin, interactionPlugin]}
          eventContent={EventItem}
          // editable={true}
          //selectable={true}
          initialView="dayGridMonth"
          events={events}
          dateClick={onDateClick}
          eventClick={onEventClick}
        />
      </div>
    </PageContainer>
  );
}
