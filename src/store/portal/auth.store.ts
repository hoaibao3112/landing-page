import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken?: string) => void;
  clearAuth: () => void;
  refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) => {
        set({ user, isAuthenticated: true });
      },

      clearAuth: () => {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          // Gọi API logout phía server để xóa HttpOnly cookies
          fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        }
      },

      refreshToken: async () => {
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          if (!res.ok) {
            set({ user: null, isAuthenticated: false });
            return false;
          }

          const json = await res.json();
          if (json.success && json.data?.user) {
            const u = json.data.user;
            set({
              user: {
                id: u.id,
                email: u.email,
                full_name: u.fullName || u.full_name || '',
                avatar_url: u.avatarUrl || u.avatar_url || null,
              },
              isAuthenticated: true,
            });
            return true;
          }

          set({ user: null, isAuthenticated: false });
          return false;
        } catch (_) {
          set({ user: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'aizen-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
