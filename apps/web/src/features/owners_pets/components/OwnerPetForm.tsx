import {
  Button,
  Card,
  CardHeader,
  FieldError,
  Form,
  Input,
  Label,
  Separator,
  Spinner,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import BackButton from "@/src/components/BackButton";

const schemaOwnerPets = z.object({
  name: z.string().min(1, "Se requiere el nombre"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  email: z.string().email("Correo no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type FormOwnerPets = z.infer<typeof schemaOwnerPets>;

type OwnerPetFormProps = {
  onSubmit: (form: FormOwnerPets) => Promise<void>;
};

export default function OwnerPetForm({ onSubmit }: OwnerPetFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schemaOwnerPets),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
    },
  });

  const onSubmitHandler = async (data: FormOwnerPets) => {
    await onSubmit(data);
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
            <p className="text-2xl font-bold mt-2">Nuevo Dueño</p>
            <p className="text-small text-default-500">
              Agrega un nuevo dueño de mascota
            </p>
          </CardHeader>
          <Separator />
          <Card.Content>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField isInvalid={!!errors?.name?.message}>
                  <Label>Nombre</Label>
                  <Input
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="ej: Juan"
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField isInvalid={!!errors?.email?.message}>
                  <Label>Correo</Label>
                  <Input
                    onChange={field.onChange}
                    value={field.value}
                    type="email"
                    placeholder="correo@ejemplo.com"
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.password?.message}>
                  <Label>Contraseña</Label>
                  <Input
                    onChange={field.onChange}
                    value={field.value}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <FieldError>{errors.password?.message}</FieldError>
                </TextField>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <TextField isInvalid={!!errors?.phone?.message}>
                    <Label>Teléfono</Label>
                    <Input
                      value={field.value}
                      onChange={field.onChange}
                      type="tel"
                      placeholder="+54 9 11 1234 5678"
                    />
                    <FieldError>{errors.phone?.message}</FieldError>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <TextField isInvalid={!!errors?.address?.message}>
                    <Label>Dirección</Label>
                    <Input
                      value={field.value}
                      onChange={field.onChange}
                      type="text"
                      placeholder="Calle y número"
                    />
                    <FieldError>{errors.address?.message}</FieldError>
                  </TextField>
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
