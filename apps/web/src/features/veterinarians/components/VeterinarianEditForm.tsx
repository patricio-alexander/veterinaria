import {
  Button,
  Input,
  Card,
  CardHeader,
  Separator,
  Form,
  TextField,
  FieldError,
  Label,
  Spinner,
} from "@heroui/react";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImagePicker from "@/src/components/ImagePicker";
import BackButton from "@/src/components/BackButton";

const editSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  license_number: z.string().min(1, "El número de licencia es requerido"),
  specialty: z.string().min(1, "La especialidad es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  photo: z.union([z.instanceof(File), z.string()]).optional(),
});

export type VeterinarianEditFormData = z.infer<typeof editSchema>;

type VeterinarianEditFormProps = {
  initialData: Partial<VeterinarianEditFormData>;
  onSubmit: (data: VeterinarianEditFormData) => Promise<void>;
};

export default function VeterinarianEditForm({
  onSubmit,

  initialData,
}: VeterinarianEditFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<VeterinarianEditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: initialData,
  });

  const submit = async (data: VeterinarianEditFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="w-xl mx-auto p-4">
      <BackButton />
      <Form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex flex-col gap-1 items-center">
            <p className="text-2xl font-bold mt-2">Editar Veterinario</p>
            <p className="text-small text-default-500">
              Actualiza los datos del veterinario
            </p>

            <div className="flex flex-col items-center gap-2">
              <Controller
                name="photo"
                control={control}
                render={(f) => (
                  <ImagePicker
                    onPick={(f) => setValue("photo", f)}
                    value={f.field.value}
                  />
                )}
              />
            </div>
          </CardHeader>
          <Separator />
          <Card.Content>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.name?.message}>
                  <Label>Nombre *</Label>
                  <Input {...field} placeholder="ej: Juan Pérez" />
                  <FieldError>{errors.name?.message}</FieldError>
                </TextField>
              )}
            />
            <Controller
              control={control}
              name="license_number"
              render={({ field }) => (
                <TextField isInvalid={!!errors.license_number?.message}>
                  <Label>Número de Licencia *</Label>
                  <Input {...field} placeholder="ej: VET-001234" />
                  <FieldError>{errors.license_number?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="specialty"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.specialty?.message}>
                  <Label>Especialidad *</Label>
                  <Input {...field} placeholder="ej: Medicina General" />
                  <FieldError>{errors.specialty?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.phone?.message}>
                  <Label>Teléfono *</Label>
                  <Input {...field} placeholder="ej: +51 999 999 999" />
                  <FieldError>{errors.phone?.message}</FieldError>
                </TextField>
              )}
            />

            <div className="flex gap-3 justify-end mt-4">
              <Button isPending={isSubmitting} type="submit">
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? "Actualizando..." : "Guardar"}
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
