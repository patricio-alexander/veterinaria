import esLocale from "@fullcalendar/core/locales/es";
import EventItem from "@/src/components/EventItem";
import dayGridPlugin from "@fullcalendar/daygrid";

import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import { DateSelectArg, EventClickArg } from "@fullcalendar/core/index.js";
import { useAuthStore } from "@/src/store/auth.store";
import { useEvents } from "../hooks/useEvents";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Loader from "@/src/components/Loader";
import FullCalendar from "@fullcalendar/react";
import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  FieldError,
  Form,
  Label,
  Modal,
  Spinner,
  TextArea,
  TextField,
  TimeField,
  TimeValue,
} from "@heroui/react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useAppointment } from "../hooks/useAppointment";
import { format } from "date-fns";
import { useChangeStatusAppointment } from "../hooks/useChangeStatusAppointment";
import { toast } from "sonner";
import { useAddUnavailableDates } from "../hooks/useAddUnavailableDates";
import { Controller, useForm } from "react-hook-form";
import {
  getLocalTimeZone,
  now,
  Time,
  today,
  toCalendarDateTime,
  type DateValue,
  parseAbsoluteToLocal,
  CalendarDate,
} from "@internationalized/date";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getOneUnavailableDate,
  getUnavailablesDates,
} from "../services/calendar.service";
import { useEditUnavailableDate } from "../hooks/useEditUnavailableDate";
import { useRemoveRemoveUnavailable } from "../hooks/useRemoveUnavailableDate";

const schemaUnavailableDates = z
  .object({
    start: z.object({
      date: z.custom<DateValue>(),
      time: z.custom<TimeValue>(),
    }),
    end: z.object({
      date: z.custom<DateValue>(),
      time: z.custom<TimeValue>(),
    }),
    reason: z.string().min(1, "Se quiere título"),
  })
  .transform((val) => {
    const combineDateTime = (date: DateValue, time: TimeValue) => {
      const dateTime = toCalendarDateTime(
        date,
        new Time(
          time.hour,
          time.minute,
          time.second ?? 0,
          time.millisecond ?? 0,
        ),
      );
      return dateTime.toDate(getLocalTimeZone()).toISOString();
    };

    return {
      start: combineDateTime(val.start.date, val.start.time),
      end: combineDateTime(val.end.date, val.end.time),
      reason: val.reason,
    };
  });

export type FormUnavailableDates = z.infer<typeof schemaUnavailableDates>;

export default function VeterinarianCalendar() {
  const { user } = useAuthStore();

  const [veterinarianId, setVeterinarianId] = useState("");
  const { data: events, isLoading } = useEvents(veterinarianId);
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentId, setOppointmentId] = useState<undefined | number>(
    undefined,
  );

  const [unavailableDateId, setUnavailableDateId] = useState<
    undefined | number
  >(undefined);

  const [isOpenTwo, setIsOpenTwo] = useState(false);
  const currentTime = now(getLocalTimeZone());

  const changeStatusAppointment = useChangeStatusAppointment();

  const addUnavailableDates = useAddUnavailableDates();
  const editUnavailableDates = useEditUnavailableDate();

  const { data: appointment, isLoading: isLoadingAppointment } =
    useAppointment(appointmentId);

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

  const onSelect = (arg: DateSelectArg) => {
    addUnavailableDates.mutate(
      {
        start: arg.start.toISOString(),
        end: arg.end.toISOString(),
        veterinarianId,
        reason: "Ocupado",
      },
      {
        onSuccess: () => {
          toast.success("Fechas bloqueadas");
        },
        onError: () => {
          toast.error("Ocurrio un error");
        },
      },
    );
  };

  const defaultValues = {
    start: {
      date: today(getLocalTimeZone()),
      time: new Time(currentTime.hour, currentTime.minute),
    },
    end: {
      date: today(getLocalTimeZone()),
      time: new Time(currentTime.hour, currentTime.minute + 1),
    },
    title: "",
    reason: "",
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemaUnavailableDates),
    defaultValues: defaultValues,
  });

  const onSubmit = (form: FormUnavailableDates) => {
    editUnavailableDates.mutate(
      {
        data: {
          reason: form.reason,
          endDate: form.end,
          startDate: form.start,
        },
        id: unavailableDateId as number,
      },
      {
        onSuccess: () => {
          toast.success("Evento editado con éxito");
        },
        onError: () => {
          toast.error("Ocurrio un error");
        },
      },
    );
  };

  const onEventClick = async (arg: EventClickArg) => {
    if (arg.event.extendedProps.status !== "unavailable") {
      setOppointmentId(Number(arg.event.id));
      openModal();
      return;
    }
    const id = Number(arg.event.id);
    const unavailableDate = await getOneUnavailableDate(id);
    setUnavailableDateId(id);

    const parsedStart = parseAbsoluteToLocal(unavailableDate?.startDate);
    const parsetEnd = parseAbsoluteToLocal(unavailableDate?.endDate);

    const appointmentData = {
      start: {
        date: new CalendarDate(
          parsedStart.year,
          parsedStart.month,
          parsedStart.day,
        ),
        time: new Time(parsedStart.hour, parsedStart.minute),
      },
      end: {
        date: new CalendarDate(parsetEnd.year, parsetEnd.month, parsetEnd.day),

        time: new Time(parsetEnd.hour, parsetEnd.minute),
      },
      reason: unavailableDate?.reason,
    };

    reset(appointmentData);
    openTwoModal();
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <FullCalendar
        locales={[esLocale]}
        plugins={[dayGridPlugin, interactionPlugin]}
        eventContent={EventItem}
        // editable={true}
        selectable={true}
        select={onSelect}
        initialView="dayGridMonth"
        events={events}
        // events={[
        //   {
        //     id: "1",
        //     title: "nose",
        //     allDay: true,
        //     start: new Date().toISOString(),
        //
        //     extendedProps: {
        //       status: "completed",
        //     },
        //   },
        // ]}
        //dateClick={onDateclick}
        eventClick={onEventClick}
      />

      <Modal isOpen={isOpenTwo} key="lg">
        <Modal.Backdrop isKeyboardDismissDisabled>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.CloseTrigger onClick={closeTwoModal} />
                <Modal.Header>
                  <Modal.Icon>
                    <CalendarIcon />
                  </Modal.Icon>
                  <Modal.Heading className="font-semibold">
                    Agendar nueva cita
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  {/* <p className="text-black font-bold text-base"> */}
                  {/*   Fecha y tiempo */}
                  {/* </p> */}
                  <div className="flex flex-col gap-4 mx-2 my-2">
                    <div className="flex justify-between gap-4">
                      <Controller
                        control={control}
                        name="start.date"
                        render={({ field }) => (
                          <DatePicker
                            className="w-64"
                            name="start.date"
                            onChange={(d) => field.onChange(d)}
                            value={field.value}
                            isInvalid={!!errors.start?.date?.message}
                          >
                            <Label>Fecha inicio</Label>
                            <DateField.Group fullWidth>
                              <DateField.Input>
                                {(segment) => (
                                  <DateField.Segment segment={segment} />
                                )}
                              </DateField.Input>
                              <DateField.Suffix>
                                <DatePicker.Trigger>
                                  <DatePicker.TriggerIndicator />
                                </DatePicker.Trigger>
                              </DateField.Suffix>
                            </DateField.Group>
                            <DatePicker.Popover>
                              <Calendar aria-label="Event date">
                                <Calendar.Header>
                                  <Calendar.YearPickerTrigger>
                                    <Calendar.YearPickerTriggerHeading />
                                    <Calendar.YearPickerTriggerIndicator />
                                  </Calendar.YearPickerTrigger>
                                  <Calendar.NavButton slot="previous" />
                                  <Calendar.NavButton slot="next" />
                                </Calendar.Header>
                                <Calendar.Grid>
                                  <Calendar.GridHeader>
                                    {(day) => (
                                      <Calendar.HeaderCell>
                                        {day}
                                      </Calendar.HeaderCell>
                                    )}
                                  </Calendar.GridHeader>
                                  <Calendar.GridBody>
                                    {(date) => <Calendar.Cell date={date} />}
                                  </Calendar.GridBody>
                                </Calendar.Grid>
                                <Calendar.YearPickerGrid>
                                  <Calendar.YearPickerGridBody>
                                    {({ year }) => (
                                      <Calendar.YearPickerCell year={year} />
                                    )}
                                  </Calendar.YearPickerGridBody>
                                </Calendar.YearPickerGrid>
                              </Calendar>
                            </DatePicker.Popover>
                          </DatePicker>
                        )}
                      />
                      <Controller
                        control={control}
                        name="start.time"
                        render={({ field }) => (
                          <TimeField
                            className="flex-1"
                            name="start.time"
                            value={field.value}
                            onChange={field.onChange}
                            isInvalid={!!errors.start?.time?.message}
                          >
                            <Label>Hora inicio</Label>
                            <TimeField.Group>
                              <TimeField.Prefix>
                                <Clock className="size-4 text-muted" />
                              </TimeField.Prefix>
                              <TimeField.Input>
                                {(segment) => (
                                  <TimeField.Segment segment={segment} />
                                )}
                              </TimeField.Input>
                            </TimeField.Group>
                          </TimeField>
                        )}
                      />
                    </div>

                    <div className="flex justify-between gap-4">
                      <Controller
                        control={control}
                        name="end.date"
                        render={({ field }) => (
                          <DatePicker
                            className="w-64"
                            name="end.date"
                            onChange={(d) => field.onChange(d)}
                            value={field.value}
                            isInvalid={!!errors.end?.date?.message}
                          >
                            <Label>Fecha fin</Label>
                            <DateField.Group fullWidth>
                              <DateField.Input>
                                {(segment) => (
                                  <DateField.Segment segment={segment} />
                                )}
                              </DateField.Input>
                              <DateField.Suffix>
                                <DatePicker.Trigger>
                                  <DatePicker.TriggerIndicator />
                                </DatePicker.Trigger>
                              </DateField.Suffix>
                            </DateField.Group>
                            <DatePicker.Popover>
                              <Calendar aria-label="Event date">
                                <Calendar.Header>
                                  <Calendar.YearPickerTrigger>
                                    <Calendar.YearPickerTriggerHeading />
                                    <Calendar.YearPickerTriggerIndicator />
                                  </Calendar.YearPickerTrigger>
                                  <Calendar.NavButton slot="previous" />
                                  <Calendar.NavButton slot="next" />
                                </Calendar.Header>
                                <Calendar.Grid>
                                  <Calendar.GridHeader>
                                    {(day) => (
                                      <Calendar.HeaderCell>
                                        {day}
                                      </Calendar.HeaderCell>
                                    )}
                                  </Calendar.GridHeader>
                                  <Calendar.GridBody>
                                    {(date) => <Calendar.Cell date={date} />}
                                  </Calendar.GridBody>
                                </Calendar.Grid>
                                <Calendar.YearPickerGrid>
                                  <Calendar.YearPickerGridBody>
                                    {({ year }) => (
                                      <Calendar.YearPickerCell year={year} />
                                    )}
                                  </Calendar.YearPickerGridBody>
                                </Calendar.YearPickerGrid>
                              </Calendar>
                            </DatePicker.Popover>
                          </DatePicker>
                        )}
                      />
                      <Controller
                        control={control}
                        name="end.time"
                        render={({ field }) => (
                          <TimeField
                            className="flex-1"
                            name="end.time"
                            value={field.value}
                            onChange={field.onChange}
                            isInvalid={!!errors.end?.time?.message}
                          >
                            <Label>Hora fin</Label>
                            <TimeField.Group>
                              <TimeField.Prefix>
                                <Clock className="size-4 text-muted" />
                              </TimeField.Prefix>
                              <TimeField.Input>
                                {(segment) => (
                                  <TimeField.Segment segment={segment} />
                                )}
                              </TimeField.Input>
                            </TimeField.Group>
                          </TimeField>
                        )}
                      />
                    </div>

                    <Controller
                      name="reason"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          name="reason"
                          isInvalid={!!errors.reason?.message}
                        >
                          <Label>Razón</Label>
                          <TextArea
                            value={field.value}
                            onChange={field.onChange}
                            aria-label="Detalles"
                            placeholder="Detalles de la no disponibilidad"
                            rows={6}
                            style={{ resize: "vertical" }}
                          />
                          <FieldError>{errors.reason?.message}</FieldError>
                        </TextField>
                      )}
                    />
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  {/* {isEdit && statusAppointment !== "cancelled" ? ( */}
                  {/*   <Button */}
                  {/*     variant="danger-soft" */}
                  {/*     onClick={() => { */}
                  {/*       changeStatusAppointment.mutate( */}
                  {/*         { status: "cancelled", appointmentId }, */}
                  {/*         { */}
                  {/*           onSuccess: () => { */}
                  {/*             toast.success("Cita cancelda con éxito"); */}
                  {/*           }, */}
                  {/*         }, */}
                  {/*       ); */}
                  {/*       closeDialog(); */}
                  {/*     }} */}
                  {/*   > */}
                  {/*     Cancelar cita */}
                  {/*   </Button> */}
                  {/* ) : ( */}
                  {/*   <Button */}
                  {/*     className="bg-green-50 text-green-600" */}
                  {/*     onClick={() => { */}
                  {/*       changeStatusAppointment.mutate( */}
                  {/*         { status: "scheduled", appointmentId }, */}
                  {/*         { */}
                  {/*           onSuccess: () => { */}
                  {/*             toast.success("Cita reactivada con éxito"); */}
                  {/*           }, */}
                  {/*         }, */}
                  {/*       ); */}
                  {/*       closeDialog(); */}
                  {/*     }} */}
                  {/*   > */}
                  {/*     Reactivar */}
                  {/*   </Button> */}
                  {/* )} */}
                  <Button
                    variant="danger-soft"
                    onClick={() => {
                      removeUnavailableDate.mutate(unavailableDateId, {
                        onSuccess: () => {
                          toast.success("Evento eliminado éxito");
                          closeTwoModal();
                        },
                        onError: () => {
                          toast.error("Ups ocurrió un error");
                          closeTwoModal();
                        },
                      });
                    }}
                  >
                    Eliminar
                  </Button>
                  <Button variant="secondary" onClick={closeTwoModal}>
                    Cerrar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal isOpen={isOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.CloseTrigger onClick={closeModal} />
              <Modal.Header>
                <Modal.Icon className="bg-primary text-primary-foreground">
                  <Calendar className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Detalle de Cita</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {isLoadingAppointment ? (
                  <div className="flex flex-col items-center">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="text-center border-b pb-4">
                      <h3 className="text-xl font-bold text-default-900">
                        {appointment?.title}
                      </h3>
                      {appointment?.description && (
                        <p className="text-default-500 text-sm mt-1">
                          {appointment.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-default-100 p-3 rounded-lg">
                        <Label className="text-default-500 text-xs">
                          Fecha inicio
                        </Label>
                        <p className="text-sm font-medium">
                          {appointment?.start
                            ? format(new Date(appointment.start), "dd/MM/yyyy")
                            : "-"}
                        </p>
                        <p className="text-xs text-default-400">
                          {appointment?.start
                            ? format(new Date(appointment.start), "HH:mm")
                            : "-"}
                        </p>
                      </div>

                      <div className="bg-default-100 p-3 rounded-lg">
                        <Label className="text-default-500 text-xs">
                          Fecha fin
                        </Label>
                        <p className="text-sm font-medium">
                          {appointment?.end
                            ? format(new Date(appointment.end), "dd/MM/yyyy")
                            : "-"}
                        </p>
                        <p className="text-xs text-default-400">
                          {appointment?.end
                            ? format(new Date(appointment.end), "HH:mm")
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-default-100 p-3 rounded-lg">
                      <Label className="text-default-500 text-xs">Costo</Label>
                      <p className="text-lg font-bold text-success">
                        ${appointment?.cost || 0}
                      </p>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                {!isLoadingAppointment &&
                  appointment?.status !== "completed" && (
                    <Button
                      className="w-full"
                      slot="close"
                      onClick={() => {
                        closeModal();
                        changeStatusAppointment.mutate(
                          { appointmentId, status: "completed" },
                          {
                            onSuccess: () => {
                              toast.success("Cita completada");
                            },
                          },
                        );
                      }}
                    >
                      Completar
                    </Button>
                  )}
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
