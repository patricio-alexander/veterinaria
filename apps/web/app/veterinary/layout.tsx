"use client";

import { Header } from "@/src/components/Header";
import { useAuthStore } from "@/src/store/auth.store";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  if (user?.role == "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
