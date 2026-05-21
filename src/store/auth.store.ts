import { create } from 'zustand';
import { secureStorage } from '@utils/storage';
import { SECURE_KEYS } from '@api/client';
import { authApi, VerifyOtpResponse } from '@api/auth.api';
import { AuthUser } from '@api/types';
import { router } from 'expo-router';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  login: (data: VerifyOtpResponse) => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => Promise<void>;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const token = await secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN);
      if (!token) {
        set({ isHydrated: true });
        return;
      }
      const res = await authApi.getMe();
      set({ user: res.data.data, accessToken: token, isHydrated: true });
    } catch {
      await secureStorage.deleteItem(SECURE_KEYS.ACCESS_TOKEN);
      await secureStorage.deleteItem(SECURE_KEYS.REFRESH_TOKEN);
      set({ user: null, accessToken: null, isHydrated: true });
    }
  },

  login: async (data: VerifyOtpResponse) => {
    await secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, data.accessToken);
    await secureStorage.setItem(
      SECURE_KEYS.REFRESH_TOKEN,
      data.refreshToken,
    );
    set({ user: data.user, accessToken: data.accessToken });
  },

  updateUser: (updates) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...updates } });
  },

  logout: async () => {
    try {
      const rt = await secureStorage.getItem(SECURE_KEYS.REFRESH_TOKEN);
      if (rt) await authApi.logout(rt);
    } catch {
      /* ignore */
    }
    await secureStorage.deleteItem(SECURE_KEYS.ACCESS_TOKEN);
    await secureStorage.deleteItem(SECURE_KEYS.REFRESH_TOKEN);
    set({ user: null, accessToken: null });
    router.replace('/(auth)/phone');
  },

  setLoading: (v) => set({ isLoading: v }),
}));

