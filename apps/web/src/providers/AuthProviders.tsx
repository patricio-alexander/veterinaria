"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setIsLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session?.user.id)
          .single();
        setUser(session?.user ? { ...session?.user, role: data?.role } : null);
        setSession(session);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(false);
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session?.user.id)
        .single();

      setUser(session?.user ? { ...session?.user, role: data?.role } : null);

      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
