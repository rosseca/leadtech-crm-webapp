import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "~/lib/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user: User, token: string) => {
        api.setToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        api.setToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Restore token to API client after rehydration
        if (state?.token) {
          api.setToken(state.token);
        }
      },
    }
  )
);
