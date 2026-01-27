import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, type UserRole } from "~/lib/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user: User, token: string, refreshToken?: string) => {
        api.setToken(token);
        api.setRefreshToken(refreshToken || null);
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
        });
      },
      updateTokens: (token: string, refreshToken: string) => {
        api.setToken(token);
        api.setRefreshToken(refreshToken);
        set({ token, refreshToken });
      },
      logout: () => {
        api.setToken(null);
        api.setRefreshToken(null);
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Restore tokens to API client after rehydration
        if (state?.token) {
          api.setToken(state.token);
        }
        if (state?.refreshToken) {
          api.setRefreshToken(state.refreshToken);
        }
        // Set up callback for token refresh
        api.setOnTokenRefreshed((newToken, newRefreshToken) => {
          useAuthStore.getState().updateTokens(newToken, newRefreshToken);
        });
      },
    }
  )
);
