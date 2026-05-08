import { PageContainer } from "@/src/components/PageContainer";

import { useVeterinarian } from "../../veterinarians/hooks/useVeterinarian";
import { useParams } from "next/navigation";
import { Calendar as CalendarIcon, Clock, Mail } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction"; // needed for dayClick
import { useState } from "react";
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

import {
  Button,
  Calendar,
  Card,
  DateField,
  DatePicker,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  TextArea,
  ComboBox,
  TextField,
  TimeField,
  TimeValue,
  ListBox,
  NumberField,
  Avatar,
} from "@heroui/react";
import Loader from "@/src/components/Loader";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePets } from "../../pets/hooks/usePets";
import { useDebounce } from "@uidotdev/usehooks";
import { getAppointmnet } from "../services/calendar.service";
import { toast } from "sonner";
import { useAppointments } from "../hooks/useAppointments";
import { EventClickArg } from "@fullcalendar/core/index.js";
import { useAddAppointment } from "../hooks/useAddAppointment";
import { useEditAppointment } from "../hooks/useEditAppointment";
import EventItem from "@/src/components/EventItem";
import { StatusAppointment } from "@reservacion-veterinaria/types";
import { useChangeStatusAppointment } from "../hooks/useChangeStatusAppointment";
import esLocale from "@fullcalendar/core/locales/es";
import BackButton from "@/src/components/BackButton";

const schemaAppointment = z
  .object({
    start: z.object({
      date: z.custom<DateValue>(),
      time: z.custom<TimeValue>(),
    }),
    end: z.object({
      date: z.custom<DateValue>(),
      time: z.custom<TimeValue>(),
    }),
    title: z.string().min(1, "Se quiere título"),
    description: z.string().optional(),
    patient: z.string().min(1, "Seleccione la mascota"),
    cost: z.number().min(0, "Se require el costo"),
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
      title: val.title,
      description: val.description,
      patient: val.patient,
      cost: val.cost,
    };
  });

export type FormAppointment = z.infer<typeof schemaAppointment>;

export default function AdminCalendar() {
  const params = useParams<{ id: string }>();
  const { data: veterinarian, isLoading } = useVeterinarian(params.id);
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

  const currentTime = now(getLocalTimeZone());
  const [search, setSearch] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const addAppointment = useAddAppointment();
  const editAppointment = useEditAppointment();
  const changeStatusAppointment = useChangeStatusAppointment();
  const [statusAppointment, setStatusAppointment] =
    useState<StatusAppointment | null>(null);

  const debounceSeacrh = useDebounce(search, 3000);

  const { data: pets, isLoading: isLoadingPets } = usePets({
    search: debounceSeacrh,
  });

  const { data: events, isLoading: isLoadingEvents } = useAppointments(
    params.id,
  );

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
    description: "",
    patient: "",
    cost: 0,
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemaAppointment),
    defaultValues: defaultValues,
  });

  if (isLoading || isLoadingPets || isLoadingEvents) {
    return <Loader />;
  }

  const handleDateClick = (arg: DateClickArg) => {
    setIsOpen(true);
    reset({
      ...defaultValues,
      start: {
        date: new CalendarDate(
          arg.date.getFullYear(),
          arg.date.getMonth() + 1,
          arg.date.getDate(),
        ),
        time: new Time(currentTime.hour, currentTime.minute),
      },
      end: {
        date: new CalendarDate(
          arg.date.getFullYear(),
          arg.date.getMonth() + 1,
          arg.date.getDate(),
        ),
        time: new Time(currentTime.hour, currentTime.minute + 30),
      },
    });
  };

  const closeDialog = () => {
    setIsEdit(false);
    reset(defaultValues);

    setIsOpen(false);
  };

  const onSubmit = async (form: FormAppointment) => {
    setIsOpen(false);
    setIsEdit(false);
    if (!isEdit) {
      addAppointment.mutate(
        {
          status: "scheduled",
          title: form.title,
          description: form.description,
          patient_id: form.patient,
          veterinarian_id: params.id,
          reminder_sent: true,
          start_date_appointment: form.start,
          end_date_appointment: form.end,
          cost: form.cost,
        },
        {
          onSuccess: () => {
            reset(defaultValues);
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
          patient_id: form.patient,
          veterinarian_id: params.id,
          reminder_sent: true,
          start_date_appointment: form.start,
          end_date_appointment: form.end,
          cost: form.cost,
        },
        id: appointmentId as number,
      },

      {
        onSuccess: () => {
          reset(defaultValues);

          return toast.success("Cita  editada con éxito");
        },
        onError: (error) => {
          console.error(error.message);
        },
      },
    );
  };

  const onEventClick = async (e: EventClickArg) => {
    setIsEdit(true);
    const id = Number(e.event.id);
    setAppointmentId(id);
    setIsOpen(true);
    const appointment = await getAppointmnet(id);
    setStatusAppointment(e.event.extendedProps.status);

    const parsedStart = parseAbsoluteToLocal(appointment?.start);
    const parsetEnd = parseAbsoluteToLocal(appointment?.end);

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
      title: appointment?.title,
      description: appointment?.description,
      patient: appointment?.patient,
      cost: appointment?.cost,
    };

    reset(appointmentData);
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

        <Modal isOpen={isOpen} key="lg">
          <Modal.Backdrop isKeyboardDismissDisabled>
            <Modal.Container size="lg">
              <Modal.Dialog>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Modal.CloseTrigger onClick={closeDialog} />
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
                      <div className="flex justify-between gap-4">
                        <Controller
                          control={control}
                          name="patient"
                          render={({ field }) => (
                            <ComboBox
                              className="flex-1"
                              value={field.value}
                              onChange={field.onChange}
                              isInvalid={!!errors.patient?.message}
                            >
                              <Label>Mascota</Label>
                              <ComboBox.InputGroup>
                                <Input
                                  placeholder="Buscar mascota..."
                                  onChange={(e) => setSearch(e.target.value)}
                                />
                                <ComboBox.Trigger />
                              </ComboBox.InputGroup>
                              <ComboBox.Popover>
                                <ListBox>
                                  {pets?.data.map((pet) => (
                                    <ListBox.Item
                                      id={pet.id}
                                      key={pet.id}
                                      textValue={pet.name}
                                    >
                                      {pet.name}
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  ))}
                                </ListBox>
                              </ComboBox.Popover>
                              <FieldError>{errors.patient?.message}</FieldError>
                            </ComboBox>
                          )}
                        />
                        <Controller
                          name="cost"
                          control={control}
                          render={({ field }) => (
                            <NumberField
                              value={field.value}
                              isInvalid={!!errors.cost?.message}
                              onChange={field.onChange}
                              name="currency-usd"
                              formatOptions={{
                                currency: "USD",
                                style: "currency",
                              }}
                            >
                              <Label>Costo (USD)</Label>
                              <NumberField.Group>
                                <NumberField.DecrementButton />
                                <NumberField.Input className="w-[100px]" />
                                <NumberField.IncrementButton />
                              </NumberField.Group>
                              <FieldError>{errors.cost?.message}</FieldError>
                            </NumberField>
                          )}
                        />{" "}
                      </div>

                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            name="title"
                            isInvalid={!!errors.title?.message}
                          >
                            <Label>Titulo</Label>
                            <Input
                              placeholder="titulo"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FieldError>{errors.title?.message}</FieldError>
                          </TextField>
                        )}
                      />
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            name="description"
                            isInvalid={!!errors.description?.message}
                          >
                            <Label>Descripcion</Label>
                            <TextArea
                              value={field.value}
                              onChange={field.onChange}
                              aria-label="Detalles"
                              placeholder="Detalles de la consulta"
                              rows={6}
                              style={{ resize: "vertical" }}
                            />
                            <FieldError>
                              {errors.description?.message}
                            </FieldError>
                          </TextField>
                        )}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    {isEdit && statusAppointment !== "cancelled" ? (
                      <Button
                        variant="danger-soft"
                        onClick={() => {
                          changeStatusAppointment.mutate(
                            { status: "cancelled", appointmentId },
                            {
                              onSuccess: () => {
                                toast.success("Cita cancelda con éxito");
                              },
                            },
                          );
                          closeDialog();
                        }}
                      >
                        Cancelar cita
                      </Button>
                    ) : (
                      <Button
                        className="bg-green-50 text-green-600"
                        onClick={() => {
                          changeStatusAppointment.mutate(
                            { status: "scheduled", appointmentId },
                            {
                              onSuccess: () => {
                                toast.success("Cita reactivada con éxito");
                              },
                            },
                          );
                          closeDialog();
                        }}
                      >
                        Reactivar
                      </Button>
                    )}

                    <Button variant="secondary" onClick={closeDialog}>
                      Cerrar
                    </Button>
                    <Button type="submit">Guardar</Button>
                  </Modal.Footer>
                </Form>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>

        <FullCalendar
          locales={[esLocale]}
          plugins={[dayGridPlugin, interactionPlugin]}
          eventContent={EventItem}
          // editable={true}
          //selectable={true}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={onEventClick}
        />
      </div>
    </PageContainer>
  );
}
