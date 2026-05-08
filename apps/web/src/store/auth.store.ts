// src/store/auth.store.ts
import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { UserRole } from "@reservacion-veterinaria/types";

type AuthUser = User & { role: UserRole };

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  session: Session | null;
  setSession: (user: Session | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  session: null,
  setSession: (session) => set({ session }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
