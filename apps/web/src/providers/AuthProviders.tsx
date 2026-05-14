"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "@/lib/supabase/client";
import { Spinner } from "@heroui/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setIsLoading, isLoading, user } = useAuthStore();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setSession(null);
        setIsLoading(false);
        return;
      }

      if (session) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error(error);
            }
            if (data) {
              setUser({ ...session.user, role: data?.role });
              setSession(session);
            }

            setIsLoading(false);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading && !user) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
