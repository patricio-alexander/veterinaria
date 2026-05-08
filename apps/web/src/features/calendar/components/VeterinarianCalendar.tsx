import esLocale from "@fullcalendar/core/locales/es";
import EventItem from "@/src/components/EventItem";
import dayGridPlugin from "@fullcalendar/daygrid";

import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction"; // needed for dayClick
import { EventClickArg } from "@fullcalendar/core/index.js";
import { useAuthStore } from "@/src/store/auth.store";
import { useAppointments } from "../hooks/useAppointments";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Loader from "@/src/components/Loader";
import FullCalendar from "@fullcalendar/react";
import { Button, Label, Modal, Spinner } from "@heroui/react";
import { Calendar } from "lucide-react";
import { useAppointment } from "../hooks/useAppointment";
import { format } from "date-fns";
import { useChangeStatusAppointment } from "../hooks/useChangeStatusAppointment";
import { toast } from "sonner";

export default function VeterinarianCalendar() {
  const { user } = useAuthStore();

  const [veterinarianId, setVeterinarianId] = useState("");
  const { data: events, isLoading } = useAppointments(veterinarianId);
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentId, setOppointmentId] = useState<undefined | number>(
    undefined,
  );

  const changeStatusAppointment = useChangeStatusAppointment();

  const { data: appointment, isLoading: isLoadingAppointment } =
    useAppointment(appointmentId);

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

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const onDateclick = (arg: DateClickArg) => {};
  const onEventClick = async (arg: EventClickArg) => {
    console.log(arg.event.id);
    setOppointmentId(Number(arg.event.id));
    openModal();
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
        //selectable={true}
        initialView="dayGridMonth"
        events={events}
        dateClick={onDateclick}
        eventClick={onEventClick}
      />
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
