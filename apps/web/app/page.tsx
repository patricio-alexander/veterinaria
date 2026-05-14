"use client";

import { useAuthStore } from "@/src/store/auth.store";
import { redirect } from "next/navigation";

export default function Home() {
  const { user, isLoading } = useAuthStore();

  if (!user && !isLoading) redirect("/auth/login");

  if (user?.role === "admin") {
    return redirect("/admin/dashboard");
  }

  if (user?.role === "veterinarian") {
    return redirect("/veterinary/calendar");
  }
}
