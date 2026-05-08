"use client";

import { Header } from "@/src/components/Header";
import { useAuthStore } from "@/src/store/auth.store";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  if (user?.role == "veterinarian") {
    redirect("/veterinary/calendar");
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
