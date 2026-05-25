import {
  Calendar,
  DateField,
  DatePicker,
  Label,
  Modal,
  TimeField,
  TimeValue,
  ComboBox,
  Input,
  ListBox,
  NumberField,
  FieldError,
  Select,
  TextField,
  Button,
  TextArea,
  Form,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getLocalTimeZone,
  Time,
  toCalendarDateTime,
  type DateValue,
  parseAbsoluteToLocal,
  CalendarDate,
} from "@internationalized/date";
import { CalendarIcon, Clock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { usePets } from "../../pets/hooks/usePets";
import { StatusAppointment } from "@reservacion-veterinaria/types";

type AppointmentType =
  | "general_consultation"
  | "vaccination"
  | "pet_grooming"
  | "surgery"
  | "emergency";

export interface AppointmentOption {
  id: number;
  key: AppointmentType;
  value: string;
}
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

    type: z.string().min(1, "Seleccione el tipo de consulta"),
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
      type: val.type,
    };
  });

type FormAppointment = z.infer<typeof schemaAppointment>;

export type Appointment = FormAppointment & { status: StatusAppointment };

type FormAppointmentProps = {
  isOpen: boolean;
  appointment?: Appointment | null;
  appointmentOptions: AppointmentOption[];
  close: () => void;
  date: string;
  onSubmit: (data: Appointment) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onReactive?: () => void;
};

export default function FormModalAppointment({
  isOpen,
  appointment,
  close,
  date,
  onSubmit,
  onCancel,
  onDelete,
  onReactive,
  appointmentOptions,
}: FormAppointmentProps) {
  const currentTime = parseAbsoluteToLocal(date);

  const calendarDate = new CalendarDate(
    currentTime.year,
    currentTime.month,
    currentTime.day,
  );

  const defaultValues = {
    start: {
      date: calendarDate,
      time: new Time(currentTime.hour, currentTime.minute),
    },
    end: {
      date: calendarDate,
      time: new Time(currentTime.hour, currentTime.minute + 1),
    },
    title: "",
    description: "",
    patient: "",
    cost: 0,
    type: "",
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
  const [search, setSearch] = useState("");

  const debounceSeacrh = useDebounce(search, 3000);

  const { data: pets, isLoading: isLoadingPets } = usePets({
    search: debounceSeacrh,
  });

  const isEdit = !!appointment;

  useEffect(() => {
    if (appointment) {
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
          date: new CalendarDate(
            parsetEnd.year,
            parsetEnd.month,
            parsetEnd.day,
          ),

          time: new Time(parsetEnd.hour, parsetEnd.minute),
        },
        title: appointment?.title,
        description: appointment?.description,
        patient: appointment?.patient,
        cost: appointment?.cost,
        type: appointment?.type,
      };

      reset(appointmentData);
    }

    if (date && !appointment) {
      reset(defaultValues);
    }
  }, [appointment, date]);

  return (
    <Modal isOpen={isOpen} key="lg">
      <Modal.Backdrop isKeyboardDismissDisabled>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.CloseTrigger onClick={close} />
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
                              {pets?.data?.map((pet) => (
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
                    />
                  </div>

                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        placeholder="Selecciona el tipo de consulta"
                        value={field.value}
                        onChange={field.onChange}
                        isInvalid={!!errors.type?.message}
                      >
                        <Label>Tipo de consulta</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {appointmentOptions.map((a) => (
                              <ListBox.Item
                                id={a.key}
                                textValue={a.value}
                                key={a.key}
                              >
                                {a.value}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>

                        <FieldError>{errors.type?.message}</FieldError>
                      </Select>
                    )}
                  />

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
                        <FieldError>{errors.description?.message}</FieldError>
                      </TextField>
                    )}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                {isEdit ? (
                  appointment?.status !== "cancelled" ? (
                    <>
                      <Button variant="danger-soft" onClick={onDelete}>
                        Eliminar
                      </Button>
                      <Button variant="danger-soft" onClick={onCancel}>
                        Cancelar cita
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="bg-green-50 text-green-600"
                      onClick={onReactive}
                    >
                      Reactivar
                    </Button>
                  )
                ) : null}

                <Button variant="secondary" onClick={close}>
                  Cerrar
                </Button>
                <Button type="submit">Guardar</Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
