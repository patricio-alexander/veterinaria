import {
  Button,
  Card,
  CardHeader,
  FieldError,
  Form,
  Label,
  Separator,
  Spinner,
  TextField,
  TextArea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import BackButton from "@/src/components/BackButton";
import FilePicker, {
  FileEntry,
  FileEntrySchema,
} from "@/src/components/FilePicker";

const ClinicalHistorySchema = z.object({
  reason: z.string().min(1, "El motivo es requerido"),
  diagnosis: z.string().min(1, "El diagnóstico es requerido"),
  treatment: z.string().min(1, "El tratamiento es requerido"),
  medications: z.string().min(1, "Los medicamentos indicados son requeridos"),
  attachments: FileEntrySchema.optional().array(),
});

export type FormClinicalHistory = z.infer<typeof ClinicalHistorySchema>;

type ClinicalHistoryFormProps = {
  onSubmit: (form: FormClinicalHistory) => Promise<void>;
  initialData?: FormClinicalHistory;
};

export default function ClinicalHistoryForm({
  onSubmit,
  initialData,
}: ClinicalHistoryFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ClinicalHistorySchema),
    defaultValues: {
      reason: initialData?.reason ?? "",
      diagnosis: initialData?.diagnosis ?? "",
      treatment: initialData?.treatment ?? "",
      medications: initialData?.medications ?? "",
      attachments: initialData?.attachments ?? [],
    },
  });

  const onSubmitHandler = async (data: FormClinicalHistory) => {
    await onSubmit(data);
    ///router.back();
  };

  return (
    <div className="w-xl mx-auto p-4">
      <BackButton />

      <Form
        onSubmit={handleSubmit(onSubmitHandler)}
        className="flex flex-col gap-4"
      >
        <Card>
          <CardHeader className="flex flex-col gap-1 items-center">
            <p className="text-2xl font-bold mt-2">
              {initialData ? "Editar Consulta" : "Nueva Consulta"}
            </p>
            <p className="text-small text-default-500">
              {initialData
                ? "Editar consulta clínico"
                : "Agrega un nueva consulta clínico"}
            </p>
          </CardHeader>
          <Separator />
          <Card.Content>
            <Controller
              control={control}
              name="reason"
              render={({ field, fieldState }) => (
                <TextField isInvalid={!!errors?.reason?.message}>
                  <Label>Motivo de consulta</Label>
                  <TextArea
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="Describe el motivo de la consulta"
                    rows={3}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="diagnosis"
              render={({ field, fieldState }) => (
                <TextField isInvalid={!!errors?.diagnosis?.message}>
                  <Label>Diagnóstico</Label>
                  <TextArea
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="Ingresa el diagnóstico"
                    rows={3}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="treatment"
              render={({ field, fieldState }) => (
                <TextField isInvalid={!!errors?.treatment?.message}>
                  <Label>Tratamiento</Label>
                  <TextArea
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="Describe el tratamiento indicado"
                    rows={3}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="medications"
              render={({ field, fieldState }) => (
                <TextField isInvalid={!!errors?.medications?.message}>
                  <Label>Medicamentos indicados</Label>
                  <TextArea
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="Lista de medicamentos recetados"
                    rows={3}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />

            <div>
              <Label className="mb-2 block">Archivos adjuntos</Label>
              <Controller
                control={control}
                name="attachments"
                render={({ field }) => (
                  <FilePicker
                    onPick={field.onChange}
                    value={field.value as FileEntry[]}
                  />
                )}
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button isPending={isSubmitting} type="submit">
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? "Agregando..." : "Guardar"}
                  </>
                )}
              </Button>
            </div>
          </Card.Content>
        </Card>
      </Form>
    </div>
  );
}
