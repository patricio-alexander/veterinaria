import esLocale from "@fullcalendar/core/locales/es";
import EventItem from "@/src/components/EventItem";
import dayGridPlugin from "@fullcalendar/daygrid";

import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction"; // needed for dayClick
import { EventClickArg } from "@fullcalendar/core/index.js";
import { useAuthStore } from "@/src/store/auth.store";
import { useEvents } from "../hooks/useEvents";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Loader from "@/src/components/Loader";
import FullCalendar from "@fullcalendar/react";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAddUnavailableDates } from "../hooks/useAddUnavailableDates";

import {
  getAppointmnet,
  getOneUnavailableDate,
} from "../services/calendar.service";
import { useEditUnavailableDate } from "../hooks/useEditUnavailableDate";
import { useRemoveRemoveUnavailable } from "../hooks/useRemoveUnavailableDate";
import { StatusAppointment } from "@reservacion-veterinaria/types";
import FormModalAppointment, {
  Appointment,
  AppointmentOption,
} from "./FormModalAppointment";
import { useAddAppointment } from "../hooks/useAddAppointment";
import { useEditAppointment } from "../hooks/useEditAppointment";
import { useRemoveAppointment } from "../hooks/useRemoveAppointment";
import FormBlockSchedule, { FormUnavailableDates } from "./FormBlockSchedule";

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

export default function VeterinarianCalendar() {
  const { user } = useAuthStore();

  const [veterinarianId, setVeterinarianId] = useState("");

  const { data: events, isLoading } = useEvents(veterinarianId);
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentId, setOppointmentId] = useState<undefined | number>(
    undefined,
  );
  const [isEdit, setIsEdit] = useState(false);

  const [date, setDate] = useState(new Date());

  const [unavailableDateId, setUnavailableDateId] = useState<
    undefined | number
  >(undefined);

  const [isOpenTwo, setIsOpenTwo] = useState(false);

  const removeAppointment = useRemoveAppointment();
  const [block, setBlock] = useState<FormUnavailableDates | null>(null);

  const addAppointment = useAddAppointment();
  const editAppointment = useEditAppointment();

  const addUnavailableDates = useAddUnavailableDates();
  const editUnavailableDates = useEditUnavailableDate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const removeUnavailableDate = useRemoveRemoveUnavailable();

  useEffect(() => {
    const fetchVeterinarian = async () => {
      const { data } = await supabase
        .from("veterinarians")
        .select("id")
        .eq("profile_id", user?.id)
        .single();

      setVeterinarianId(data?.id);
    };
    if (user?.id) {
      fetchVeterinarian();
    }
  }, [user?.id]);

  const openTwoModal = () => {
    setIsOpenTwo(true);
  };

  const closeTwoModal = () => {
    setIsOpenTwo(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const onDateClick = (arg: DateClickArg) => {
    openModal();
    setDate(arg.date);
  };

  const onSubmit = async (form: Appointment) => {
    openModal();
    setIsEdit(false);
    if (!isEdit) {
      addAppointment.mutate(
        {
          status: "scheduled",
          title: form.title,
          description: form.description,
          patientId: form.patient,
          veterinarianId: veterinarianId,
          startDateAppointment: form.start,
          endDateAppointment: form.end,
          cost: form.cost,
          type: form.type,
        },
        {
          onSuccess: () => {
            setAppointment(null);

            closeModal();
            return toast.success("Cita agendada con éxito");
          },
          onError: (error) => {
            console.error(error.message);
          },
        },
      );
      return;
    }
    setIsEdit(false);
    setAppointment(null);
    editAppointment.mutate(
      {
        data: {
          status: "rescheduled",
          title: form.title,
          description: form.description,
          patientId: form.patient,
          veterinarianId: veterinarianId,
          startDateAppointment: form.start,
          endDateAppointment: form.end,
          cost: form.cost,
          type: form.type,
        },
        id: appointmentId as number,
      },

      {
        onSuccess: () => {
          closeModal();

          return toast.success("Cita  editada con éxito");
        },
        onError: (error) => {
          closeModal();
          console.error(error.message);
        },
      },
    );
  };

  const onSubmitScheduleBlock = (data: FormUnavailableDates) => {
    setBlock(null);

    if (!isEdit) {
      addUnavailableDates.mutate(
        {
          start: data.start,
          end: data.end,
          veterinarianId,
          reason: data.reason,
        },
        {
          onSuccess: () => {
            toast.success("Fechas bloqueadas");
            closeTwoModal();
          },
          onError: () => {
            toast.error("Ocurrio un error");
            closeTwoModal();
          },
        },
      );
      return;
    }

    setIsEdit(false);
    editUnavailableDates.mutate(
      {
        id: unavailableDateId,
        data: {
          startDate: data.start,
          endDate: data.end,
          reason: data.reason,
        },
      },
      {
        onSuccess: () => {
          toast.success("Fechas bloqueadas");
          closeTwoModal();
        },
        onError: () => {
          toast.error("Ocurrio un error");
          closeTwoModal();
        },
      },
    );
  };

  const onEventClick = async (arg: EventClickArg) => {
    if (arg.event.extendedProps.status !== "unavailable") {
      openModal();

      setOppointmentId(Number(arg.event.id));
      setIsEdit(true);
      const appointment = await getAppointmnet(Number(arg.event.id));

      setAppointment({
        ...appointment,
        status: arg.event.extendedProps.status as StatusAppointment,
      });

      setDate(arg.event.start);
      return;
    }

    const id = Number(arg.event.id);
    const unavailableDate = await getOneUnavailableDate(id);
    setUnavailableDateId(id);
    setIsEdit(true);

    setBlock({
      reason: unavailableDate.reason,
      end: unavailableDate.endDate,
      start: unavailableDate.startDate,
    });

    openTwoModal();
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Button className="mb-4" onClick={() => openTwoModal()}>
        <Plus /> Bloquear horarios
      </Button>
      <FormBlockSchedule
        onDelete={() => {
          removeUnavailableDate.mutate(unavailableDateId, {
            onSuccess: () => {
              toast.success("Evento eliminado éxito");
              closeTwoModal();
              setBlock(null);
              setIsEdit(false);
            },
            onError: () => {
              toast.error("Ups ocurrió un error");
              closeTwoModal();
              setBlock(null);
              setIsEdit(false);
            },
          });
        }}
        block={block}
        isOpen={isOpenTwo}
        close={() => {
          setBlock(null);
          closeTwoModal();
        }}
        onSubmit={onSubmitScheduleBlock}
      />

      <FormModalAppointment
        appointmentOptions={APPOINTMENTS_OPTIONS}
        isOpen={isOpen}
        appointment={appointment}
        close={() => {
          closeModal();
          setAppointment(null);
          setIsEdit(false);
        }}
        date={date.toISOString()}
        onSubmit={onSubmit}
        onDelete={() => {
          removeAppointment.mutate(appointmentId, {
            onSuccess: () => {
              setIsEdit(false);
              toast.success("Eliminado correctamente");
              closeModal();
            },
          });
        }}
        onReactive={() => {}}
      />

      <FullCalendar
        locales={[esLocale]}
        plugins={[dayGridPlugin, interactionPlugin]}
        eventContent={EventItem}
        // editable={true}
        //select={onSelect}
        initialView="dayGridMonth"
        events={events}
        headerToolbar={{
          start: "dayGridMonth,dayGridWeek,dayGridDay",
          end: "today,prev,next",
        }}
        dateClick={onDateClick}
        eventClick={onEventClick}
      />
      {/* <FormModalAppointment */}
      {/*   date={date.toISOString()} */}
      {/*   isOpen={state.isOpen} */}
      {/*   close={() => { */}
      {/*     state.close(); */}
      {/*   }} */}
      {/* /> */}

      {/* <Modal isOpen={isOpenTwo} key="lg"> */}
      {/*   <Modal.Backdrop isKeyboardDismissDisabled> */}
      {/*     <Modal.Container size="lg"> */}
      {/*       <Modal.Dialog> */}
      {/*         <Form onSubmit={handleSubmit(onSubmit)}> */}
      {/*           <Modal.CloseTrigger onClick={closeTwoModal} /> */}
      {/*           <Modal.Header> */}
      {/*             <Modal.Icon> */}
      {/*               <CalendarIcon /> */}
      {/*             </Modal.Icon> */}
      {/*             <Modal.Heading className="font-semibold"> */}
      {/*               No disponibilidad */}
      {/*             </Modal.Heading> */}
      {/*           </Modal.Header> */}
      {/*           <Modal.Body> */}
      {/*             <div className="flex flex-col gap-4 mx-2 my-2"> */}
      {/*               <div className="flex justify-between gap-4"> */}
      {/*                 <Controller */}
      {/*                   control={control} */}
      {/*                   name="start.date" */}
      {/*                   render={({ field }) => ( */}
      {/*                     <DatePicker */}
      {/*                       className="w-64" */}
      {/*                       name="start.date" */}
      {/*                       onChange={(d) => field.onChange(d)} */}
      {/*                       value={field.value} */}
      {/*                       isInvalid={!!errors.start?.date?.message} */}
      {/*                     > */}
      {/*                       <Label>Fecha inicio</Label> */}
      {/*                       <DateField.Group fullWidth> */}
      {/*                         <DateField.Input> */}
      {/*                           {(segment) => ( */}
      {/*                             <DateField.Segment segment={segment} /> */}
      {/*                           )} */}
      {/*                         </DateField.Input> */}
      {/*                         <DateField.Suffix> */}
      {/*                           <DatePicker.Trigger> */}
      {/*                             <DatePicker.TriggerIndicator /> */}
      {/*                           </DatePicker.Trigger> */}
      {/*                         </DateField.Suffix> */}
      {/*                       </DateField.Group> */}
      {/*                       <DatePicker.Popover> */}
      {/*                         <Calendar aria-label="Event date"> */}
      {/*                           <Calendar.Header> */}
      {/*                             <Calendar.YearPickerTrigger> */}
      {/*                               <Calendar.YearPickerTriggerHeading /> */}
      {/*                               <Calendar.YearPickerTriggerIndicator /> */}
      {/*                             </Calendar.YearPickerTrigger> */}
      {/*                             <Calendar.NavButton slot="previous" /> */}
      {/*                             <Calendar.NavButton slot="next" /> */}
      {/*                           </Calendar.Header> */}
      {/*                           <Calendar.Grid> */}
      {/*                             <Calendar.GridHeader> */}
      {/*                               {(day) => ( */}
      {/*                                 <Calendar.HeaderCell> */}
      {/*                                   {day} */}
      {/*                                 </Calendar.HeaderCell> */}
      {/*                               )} */}
      {/*                             </Calendar.GridHeader> */}
      {/*                             <Calendar.GridBody> */}
      {/*                               {(date) => <Calendar.Cell date={date} />} */}
      {/*                             </Calendar.GridBody> */}
      {/*                           </Calendar.Grid> */}
      {/*                           <Calendar.YearPickerGrid> */}
      {/*                             <Calendar.YearPickerGridBody> */}
      {/*                               {({ year }) => ( */}
      {/*                                 <Calendar.YearPickerCell year={year} /> */}
      {/*                               )} */}
      {/*                             </Calendar.YearPickerGridBody> */}
      {/*                           </Calendar.YearPickerGrid> */}
      {/*                         </Calendar> */}
      {/*                       </DatePicker.Popover> */}
      {/*                     </DatePicker> */}
      {/*                   )} */}
      {/*                 /> */}
      {/*                 <Controller */}
      {/*                   control={control} */}
      {/*                   name="start.time" */}
      {/*                   render={({ field }) => ( */}
      {/*                     <TimeField */}
      {/*                       className="flex-1" */}
      {/*                       name="start.time" */}
      {/*                       value={field.value} */}
      {/*                       onChange={field.onChange} */}
      {/*                       isInvalid={!!errors.start?.time?.message} */}
      {/*                     > */}
      {/*                       <Label>Hora inicio</Label> */}
      {/*                       <TimeField.Group> */}
      {/*                         <TimeField.Prefix> */}
      {/*                           <Clock className="size-4 text-muted" /> */}
      {/*                         </TimeField.Prefix> */}
      {/*                         <TimeField.Input> */}
      {/*                           {(segment) => ( */}
      {/*                             <TimeField.Segment segment={segment} /> */}
      {/*                           )} */}
      {/*                         </TimeField.Input> */}
      {/*                       </TimeField.Group> */}
      {/*                     </TimeField> */}
      {/*                   )} */}
      {/*                 /> */}
      {/*               </div> */}
      {/**/}
      {/*               <div className="flex justify-between gap-4"> */}
      {/*                 <Controller */}
      {/*                   control={control} */}
      {/*                   name="end.date" */}
      {/*                   render={({ field }) => ( */}
      {/*                     <DatePicker */}
      {/*                       className="w-64" */}
      {/*                       name="end.date" */}
      {/*                       onChange={(d) => field.onChange(d)} */}
      {/*                       value={field.value} */}
      {/*                       isInvalid={!!errors.end?.date?.message} */}
      {/*                     > */}
      {/*                       <Label>Fecha fin</Label> */}
      {/*                       <DateField.Group fullWidth> */}
      {/*                         <DateField.Input> */}
      {/*                           {(segment) => ( */}
      {/*                             <DateField.Segment segment={segment} /> */}
      {/*                           )} */}
      {/*                         </DateField.Input> */}
      {/*                         <DateField.Suffix> */}
      {/*                           <DatePicker.Trigger> */}
      {/*                             <DatePicker.TriggerIndicator /> */}
      {/*                           </DatePicker.Trigger> */}
      {/*                         </DateField.Suffix> */}
      {/*                       </DateField.Group> */}
      {/*                       <DatePicker.Popover> */}
      {/*                         <Calendar aria-label="Event date"> */}
      {/*                           <Calendar.Header> */}
      {/*                             <Calendar.YearPickerTrigger> */}
      {/*                               <Calendar.YearPickerTriggerHeading /> */}
      {/*                               <Calendar.YearPickerTriggerIndicator /> */}
      {/*                             </Calendar.YearPickerTrigger> */}
      {/*                             <Calendar.NavButton slot="previous" /> */}
      {/*                             <Calendar.NavButton slot="next" /> */}
      {/*                           </Calendar.Header> */}
      {/*                           <Calendar.Grid> */}
      {/*                             <Calendar.GridHeader> */}
      {/*                               {(day) => ( */}
      {/*                                 <Calendar.HeaderCell> */}
      {/*                                   {day} */}
      {/*                                 </Calendar.HeaderCell> */}
      {/*                               )} */}
      {/*                             </Calendar.GridHeader> */}
      {/*                             <Calendar.GridBody> */}
      {/*                               {(date) => <Calendar.Cell date={date} />} */}
      {/*                             </Calendar.GridBody> */}
      {/*                           </Calendar.Grid> */}
      {/*                           <Calendar.YearPickerGrid> */}
      {/*                             <Calendar.YearPickerGridBody> */}
      {/*                               {({ year }) => ( */}
      {/*                                 <Calendar.YearPickerCell year={year} /> */}
      {/*                               )} */}
      {/*                             </Calendar.YearPickerGridBody> */}
      {/*                           </Calendar.YearPickerGrid> */}
      {/*                         </Calendar> */}
      {/*                       </DatePicker.Popover> */}
      {/*                     </DatePicker> */}
      {/*                   )} */}
      {/*                 /> */}
      {/*                 <Controller */}
      {/*                   control={control} */}
      {/*                   name="end.time" */}
      {/*                   render={({ field }) => ( */}
      {/*                     <TimeField */}
      {/*                       className="flex-1" */}
      {/*                       name="end.time" */}
      {/*                       value={field.value} */}
      {/*                       onChange={field.onChange} */}
      {/*                       isInvalid={!!errors.end?.time?.message} */}
      {/*                     > */}
      {/*                       <Label>Hora fin</Label> */}
      {/*                       <TimeField.Group> */}
      {/*                         <TimeField.Prefix> */}
      {/*                           <Clock className="size-4 text-muted" /> */}
      {/*                         </TimeField.Prefix> */}
      {/*                         <TimeField.Input> */}
      {/*                           {(segment) => ( */}
      {/*                             <TimeField.Segment segment={segment} /> */}
      {/*                           )} */}
      {/*                         </TimeField.Input> */}
      {/*                       </TimeField.Group> */}
      {/*                     </TimeField> */}
      {/*                   )} */}
      {/*                 /> */}
      {/*               </div> */}
      {/**/}
      {/*               <Controller */}
      {/*                 name="reason" */}
      {/*                 control={control} */}
      {/*                 render={({ field }) => ( */}
      {/*                   <TextField */}
      {/*                     name="reason" */}
      {/*                     isInvalid={!!errors.reason?.message} */}
      {/*                   > */}
      {/*                     <Label>Razón</Label> */}
      {/*                     <TextArea */}
      {/*                       value={field.value} */}
      {/*                       onChange={field.onChange} */}
      {/*                       aria-label="Detalles" */}
      {/*                       placeholder="Detalles de la no disponibilidad" */}
      {/*                       rows={6} */}
      {/*                       style={{ resize: "vertical" }} */}
      {/*                     /> */}
      {/*                     <FieldError>{errors.reason?.message}</FieldError> */}
      {/*                   </TextField> */}
      {/*                 )} */}
      {/*               /> */}
      {/*             </div> */}
      {/*           </Modal.Body> */}
      {/*           <Modal.Footer> */}
      {/*             <Button */}
      {/*               variant="danger-soft" */}
      {/*               onClick={() => { */}
      {/*                 removeUnavailableDate.mutate(unavailableDateId, { */}
      {/*                   onSuccess: () => { */}
      {/*                     toast.success("Evento eliminado éxito"); */}
      {/*                     closeTwoModal(); */}
      {/*                   }, */}
      {/*                   onError: () => { */}
      {/*                     toast.error("Ups ocurrió un error"); */}
      {/*                     closeTwoModal(); */}
      {/*                   }, */}
      {/*                 }); */}
      {/*               }} */}
      {/*             > */}
      {/*               Eliminar */}
      {/*             </Button> */}
      {/*             <Button variant="secondary" onClick={closeTwoModal}> */}
      {/*               Cerrar */}
      {/*             </Button> */}
      {/*             <Button type="submit">Guardar</Button> */}
      {/*           </Modal.Footer> */}
      {/*         </Form> */}
      {/*       </Modal.Dialog> */}
      {/*     </Modal.Container> */}
      {/*   </Modal.Backdrop> */}
      {/* </Modal> */}
    </>
  );
}
