import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  DateValue,
  FieldError,
  Form,
  Label,
  Modal,
  TextArea,
  TextField,
  TimeField,
  TimeValue,
} from "@heroui/react";
import { CalendarIcon, Clock, Plus, Syringe } from "lucide-react";
import { useAddUnavailableDates } from "../hooks/useAddUnavailableDates";
import { useEditUnavailableDate } from "../hooks/useEditUnavailableDate";
import z from "zod";

import {
  getLocalTimeZone,
  now,
  Time,
  today,
  toCalendarDateTime,
  parseAbsoluteToLocal,
  CalendarDate,
} from "@internationalized/date";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

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

type FormBlockScheduleProps = {
  close: () => void;
  isOpen: boolean;
  onSubmit: (data: FormUnavailableDates) => void;
  block?: FormUnavailableDates | null;
  onDelete?: () => void;
};

export default function FormBlockSchedule({
  close,
  isOpen,
  onSubmit,
  block,
  onDelete,
}: FormBlockScheduleProps) {
  const currentTime = now(getLocalTimeZone());
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

  const isEdit = !!block;

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemaUnavailableDates),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (block) {
      const parsedStart = parseAbsoluteToLocal(block?.start);
      const parsetEnd = parseAbsoluteToLocal(block?.end);

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
        reason: block?.reason,
      };

      reset(appointmentData);
    }
  }, [block]);

  // const onSubmit = (form: FormUnavailableDates) => {
  //   editUnavailableDates.mutate(
  //     {
  //       data: {
  //         reason: form.reason,
  //         endDate: form.end,
  //         startDate: form.start,
  //       },
  //       id: unavailableDateId as number,
  //     },
  //     {
  //       onSuccess: () => {
  //         toast.success("Evento editado con éxito");
  //       },
  //       onError: () => {
  //         toast.error("Ocurrio un error");
  //       },
  //     },
  //   );
  // };

  return (
    <Modal key="lg" isOpen={isOpen}>
      <Modal.Backdrop isKeyboardDismissDisabled>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Form
              onSubmit={handleSubmit((data) => {
                onSubmit(data);
                reset(defaultValues);
              })}
            >
              <Modal.CloseTrigger onClick={close} />
              <Modal.Header>
                <Modal.Icon>
                  <CalendarIcon />
                </Modal.Icon>
                <Modal.Heading className="font-semibold">
                  Bloquear horarios
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
                {isEdit && (
                  <Button variant="danger-soft" onClick={onDelete}>
                    Eliminar
                  </Button>
                )}

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
