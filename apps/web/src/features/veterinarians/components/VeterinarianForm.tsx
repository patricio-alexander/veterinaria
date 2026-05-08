import {
  Button,
  Input,
  Card,
  CardHeader,
  Separator,
  TextField,
  FieldError,
  Label,
  Spinner,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImagePicker from "@/src/components/ImagePicker";
import { useRouter } from "next/navigation";
import BackButton from "@/src/components/BackButton";

const veterinarianSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  license_number: z.string().min(1, "El número de licencia es requerido"),
  specialty: z.string().min(1, "La especialidad es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  photo: z.instanceof(File).nullable(),
});

export type VeterinarianFormData = z.infer<typeof veterinarianSchema>;

type VeterinarianFormProps = {
  onSubmit: (data: VeterinarianFormData) => Promise<void>;
};

export default function VeterinarianForm({ onSubmit }: VeterinarianFormProps) {
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(veterinarianSchema),
    defaultValues: {
      name: "",
      license_number: "",
      specialty: "",
      phone: "",
      email: "",
      password: "",
      photo: null,
    },
  });

  const submit = async (data: VeterinarianFormData) => {
    await onSubmit(data);
    router.back();
  };

  return (
    <div className="w-xl mx-auto p-4">
      <BackButton />
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex flex-col gap-1 items-center">
            <p className="text-2xl font-bold mt-2">Nuevo Veterinario</p>
            <p className="text-small text-default-500">
              Agrega un nuevo veterinario al sistema
            </p>

            <div className="flex flex-col items-center gap-2">
              <Controller
                name="photo"
                control={control}
                render={() => (
                  <ImagePicker onPick={(f) => setValue("photo", f)} />
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
                <TextField isInvalid={!!errors?.license_number?.message}>
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

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.email?.message}>
                  <Label>Correo Electrónico *</Label>
                  <Input
                    {...field}
                    type="email"
                    placeholder="veterinario@ejemplo.com"
                  />
                  <FieldError>{errors.email?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.password?.message}>
                  <Label>Contraseña *</Label>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <FieldError>{errors.password?.message}</FieldError>
                </TextField>
              )}
            />

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
      </form>
    </div>
  );
}
