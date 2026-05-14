"use client";

import {
  Button,
  Input,
  Card,
  CardHeader,
  Separator,
  Link,
  Form,
  TextField,
  FieldError,
  Label,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (!error) router.replace("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 px-1">
          <p className="text-[11px] uppercase text-zinc-400 mb-1">
            Vet Clínico
          </p>
          <h1 className="font-serif text-3xl  text-zinc-900  leading-tight">
            Bienvenido <em>de vuelta</em>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none rounded-2xl">
          <Card.Content>
            <Form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <TextField isInvalid={!!errors?.email?.message}>
                <Label className="text-[11px] uppercase tracking-wider font-medium">
                  Correo
                </Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="correo@ejemplo.com"
                />
                <FieldError>{errors.email?.message}</FieldError>
              </TextField>

              <TextField isInvalid={!!errors?.password?.message}>
                <Label className="text-[11px] uppercase tracking-wider font-medium">
                  Contraseña
                </Label>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="Ingresa tu contraseña"
                />
                <FieldError>{errors.password?.message}</FieldError>
              </TextField>

              <div className="flex justify-end">
                <Link href="/auth/forgot-password">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Button
                type="submit"
                isPending={isSubmitting}
                className="w-full h-11 mt-1 bg-zinc-900 text-zinc-50 rounded-xl font-medium text-sm hover:opacity-85 transition-opacity"
              >
                Iniciar sesión
              </Button>
            </Form>
          </Card.Content>
          <Separator />
        </Card>
      </div>
    </div>
  );
}
