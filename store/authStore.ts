import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Role } from '../types/roles';

interface AuthStore {
  user: User | null;
  role: Role | null;
  token: string | null;
  schoolId: string | null;
  setAuth: (data: { user: User; token: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      token: null,
      schoolId: null,
      setAuth: ({ user, token }) =>
        set({
          user,
          role: user.role,
          token,
          schoolId: user.schoolId || null,
        }),
      clearAuth: () =>
        set({
          user: null,
          role: null,
          token: null,
          schoolId: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
