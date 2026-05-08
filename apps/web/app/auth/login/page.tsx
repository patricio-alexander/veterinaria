"use client";

import LoginForm from "@/src/features/auth/components/LoginForm";
import { useAuthStore } from "@/src/store/auth.store";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { user } = useAuthStore();

  if (user) {
    redirect("/");
  }

  return <LoginForm />;
}
