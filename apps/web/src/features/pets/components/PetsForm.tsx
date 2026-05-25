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
import BackButton from "@/src/components/BackButton";
import { useSpecies } from "../hooks/useSpecies";

const petsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  species: z.number().min(1, "La especie es requerida"),
  breed: z.string().min(1, "La raza es requerida"),
  sex: z.enum(["male", "female"], {
    error: "Se requiere el sexo",
  }),
  age: z.coerce.number().min(1, "La edad debe ser un número positivo"),
  weight: z.coerce.number().min(0.01, "El peso debe ser mayor a 0"),
  photo: z.union([z.instanceof(File), z.string()]).optional(),
  owner: z.string().min(1, "Seleccione el dueño"),
  sterilized: z
    .string()
    .min(1, "Es requerido")
    .transform((v) => v === "true"),
  color: z.string().min(1, "El color es requerido"),
});

export type PetsFormData = z.infer<typeof petsSchema>;

type PetsFormProps = {
  initialData?: PetsFormData;
  onSubmit: (data: PetsFormData) => Promise<void>;
};

export default function PetsForm({ initialData, onSubmit }: PetsFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(petsSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      species: initialData?.species ?? 0,
      breed: initialData?.breed ?? "",
      sex: initialData?.sex ?? undefined,
      age: initialData?.age ?? 0,
      weight: initialData?.age ?? 0,
      photo: initialData?.photo ?? undefined,
      sterilized: String(initialData?.sterilized) ?? "",
      color: initialData?.color ?? "",
      owner: initialData?.owner ?? "",
    },
  });

  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);

  const { data: owners } = useOwnerPets({ search: debounceSearch, limit: 5 });
  const { data: species } = useSpecies();

  const onSubmitHandler = async (data: PetsFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="mx-auto p-4">
      <BackButton />

      <Form
        onSubmit={handleSubmit(onSubmitHandler)}
        className="flex flex-col gap-4 w-xl"
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
          <Card.Content className="grid grid-cols-2 gap-x-10">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField isInvalid={!!errors?.name?.message} className="mb-2">
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
              name="breed"
              render={({ field }) => (
                <TextField
                  isInvalid={!!errors?.breed?.message}
                  className="mb-2"
                >
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
              control={control}
              name="color"
              render={({ field }) => (
                <TextField
                  isInvalid={!!errors?.color?.message}
                  className="mb-2"
                >
                  <Label>Color</Label>
                  <Input
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="ej: Café con negro"
                  />
                  <FieldError>{errors.color?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              name="sex"
              control={control}
              render={({ field }) => (
                <TextField isInvalid={!!errors.sex?.message} className="mb-2">
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
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="age"
              render={({ field }) => (
                <TextField isInvalid={!!errors?.age?.message} className="mb-2">
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
              name="sterilized"
              control={control}
              render={({ field }) => (
                <TextField
                  isInvalid={!!errors?.sterilized?.message}
                  className="mb-2"
                >
                  <Label>Esterilizado</Label>
                  <RadioGroup
                    isInvalid={!!errors?.sex?.message}
                    orientation="horizontal"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <Radio value="true">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content>
                        <Label>Si</Label>
                      </Radio.Content>
                    </Radio>
                    <Radio value="false">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content>
                        <Label>No</Label>
                      </Radio.Content>
                    </Radio>

                    <FieldError>{errors?.sterilized?.message}</FieldError>
                  </RadioGroup>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="weight"
              render={({ field }) => (
                <TextField
                  isInvalid={!!errors?.weight?.message}
                  className="mb-2"
                >
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
                  className="mb-2"
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

            <Controller
              control={control}
              name="species"
              render={({ field }) => (
                <ComboBox
                  className="mb-2"
                  value={field.value}
                  onChange={field.onChange}
                  isInvalid={!!errors.species?.message}
                >
                  <Label>Especie</Label>
                  <ComboBox.InputGroup>
                    <Input
                      placeholder="Buscar el especie..."
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                    <ComboBox.Trigger />
                  </ComboBox.InputGroup>
                  <ComboBox.Popover>
                    <ListBox>
                      {species?.data?.map((specie) => (
                        <ListBox.Item
                          key={specie.id}
                          id={specie.id}
                          textValue={specie.name}
                        >
                          {specie.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </ComboBox.Popover>
                  <FieldError>{errors.species?.message}</FieldError>
                </ComboBox>
              )}
            />

            <div className="flex gap-3 justify-end mt-4 col-span-full">
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
