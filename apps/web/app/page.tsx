"use client";

import { useAuthStore } from "@/src/store/auth.store";
import { Spinner } from "@heroui/react";
import { redirect } from "next/navigation";

export default function Home() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Spinner />
      </div>
    );
  }

  if (!user) redirect("/auth/login");

  if (user.role === "admin") {
    return redirect("/admin/dashboard");
  }

  if (user.role === "veterinarian") {
    return redirect("/veterinary/calendar");
  }
}
