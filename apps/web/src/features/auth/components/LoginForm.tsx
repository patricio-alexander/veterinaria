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
import { useAuthStore } from "@/src/store/auth.store";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { setUser, setSession } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setUser(result.data.user);
    setSession(result.data.session);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center">
          <p className="text-2xl font-bold">Bienvenido</p>
          <p className="text-small text-default-500">
            Inicia sesión en tu cuenta
          </p>
        </CardHeader>
        <Separator />
        <Card.Content>
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <TextField isInvalid={!!errors?.email?.message}>
              <Label>Correo</Label>
              <Input
                {...register("email")}
                type="email"
                placeholder="correo@ejemplo.com"
              />
              <FieldError>{errors.email?.message}</FieldError>
            </TextField>

            <TextField isInvalid={!!errors?.password?.message}>
              <Label>Correo</Label>
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
            <Button type="submit" className="w-full" isPending={isSubmitting}>
              Iniciar sesión
            </Button>
          </Form>
        </Card.Content>
        <Separator />
      </Card>
    </div>
  );
}
