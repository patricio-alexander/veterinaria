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
  RadioGroup,
  Radio,
  Spinner,
  ComboBox,
  ListBox,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImagePicker from "@/src/components/ImagePicker";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useOwnerPets } from "../../owners_pets/hooks/useOwnerPets";
import { useRouter } from "next/navigation";
import BackButton from "@/src/components/BackButton";

const petsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  species: z.string().min(1, "La especie es requerida"),
  breed: z.string().min(1, "La raza es requerida"),
  sex: z.enum(["male", "female"], {
    error: "Se requiere el sexo",
  }),
  age: z.coerce.number().min(1, "La edad debe ser un número positivo"),
  weight: z.coerce.number().min(0.01, "El peso debe ser mayor a 0"),
  photo: z.union([z.instanceof(File), z.string()]).optional(),
  owner: z.string("Seleccione el dueño"),
});

export type PetsFormData = z.infer<typeof petsSchema>;

type PetsFormProps = {
  initialData?: PetsFormData;
  onSubmit: (data: PetsFormData) => Promise<void>;
};

export default function PetsForm({ initialData, onSubmit }: PetsFormProps) {
  const router = useRouter();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(petsSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      species: initialData?.species ?? "",
      breed: initialData?.breed ?? "",
      sex: initialData?.sex ?? undefined,
      age: initialData?.age ?? 0,
      weight: initialData?.age ?? 0,
      photo: initialData?.photo ?? undefined,
      owner: initialData?.owner ?? "",
    },
  });

  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);

  const { data: owners } = useOwnerPets({ search: debounceSearch, limit: 5 });

  const onSubmitHandler = async (data: PetsFormData) => {
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
            <div className="flex flex-col items-center gap-2">
              <Controller
                name="photo"
                control={control}
                render={() => (
                  <ImagePicker
                    onPick={(f) => setValue("photo", f)}
                    value={initialData?.photo}
                  />
                )}
              />
            </div>
            <p className="text-2xl font-bold mt-2">Nueva Mascota</p>
            <p className="text-small text-default-500">
              Agrega una nueva mascota al sistema
            </p>
          </CardHeader>
          <Separator />
          <Card.Content>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField isInvalid={!!errors?.name?.message}>
                  <Label>Nombre </Label>
                  <Input
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="ej: Max"
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="species"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.species?.message}>
                  <Label>Especie </Label>
                  <Input
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="ej: Perro, Gato, etc."
                  />
                  <FieldError>{errors.species?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="breed"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.breed?.message}>
                  <Label>Raza </Label>
                  <Input
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="ej: Labrador, Golden Retriever"
                  />
                  <FieldError>{errors.breed?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              name="sex"
              control={control}
              render={({ field }) => (
                <div>
                  <Label>Sexo </Label>
                  <RadioGroup
                    isInvalid={!!errors?.sex?.message}
                    orientation="horizontal"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <Radio value="male">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content>
                        <Label>Macho</Label>
                      </Radio.Content>
                    </Radio>
                    <Radio value="female">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content>
                        <Label>Femenino</Label>
                      </Radio.Content>
                    </Radio>

                    <FieldError>{errors?.sex?.message}</FieldError>
                  </RadioGroup>
                </div>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="age"
                render={({ field }) => (
                  <TextField isInvalid={!!errors?.age?.message}>
                    <Label>Edad (años) </Label>
                    <Input
                      value={field.value as string}
                      onChange={field.onChange}
                      type="number"
                      placeholder="ej: 3"
                    />
                    <FieldError>{errors.age?.message}</FieldError>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="weight"
                render={({ field }) => (
                  <TextField isInvalid={!!errors?.weight?.message}>
                    <Label>Peso (kg) </Label>
                    <Input
                      value={field.value as string}
                      onChange={field.onChange}
                      type="number"
                      step="0.01"
                      placeholder="ej: 15.5"
                    />
                    <FieldError>{errors.weight?.message}</FieldError>
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="owner"
                render={({ field }) => (
                  <ComboBox
                    className="w-[256px]"
                    value={field.value}
                    onChange={field.onChange}
                    isInvalid={!!errors.owner?.message}
                  >
                    <Label>Dueño</Label>
                    <ComboBox.InputGroup>
                      <Input
                        placeholder="Buscar el dueño..."
                        onChange={(e) => {
                          setSearch(e.target.value);
                        }}
                      />
                      <ComboBox.Trigger />
                    </ComboBox.InputGroup>
                    <ComboBox.Popover>
                      <ListBox>
                        {owners?.data?.map((owner) => (
                          <ListBox.Item
                            key={owner.id}
                            id={owner.id}
                            textValue={owner.profiles?.name}
                          >
                            {owner.profiles?.name} - {owner.profiles?.email}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </ComboBox.Popover>
                    <FieldError>{errors.owner?.message}</FieldError>
                  </ComboBox>
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
