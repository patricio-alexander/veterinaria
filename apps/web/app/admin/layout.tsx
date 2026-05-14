"use client";

import { Header } from "@/src/components/Header";
import Loader from "@/src/components/Loader";
import { useAuthStore } from "@/src/store/auth.store";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loader />;
  }

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
