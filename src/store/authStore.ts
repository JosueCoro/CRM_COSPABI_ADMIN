import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserAdmin } from '../services/usuario.service';

interface AuthState {
    user: UserAdmin | null;
    permissions: string[];
    isAuthenticated: boolean;
    setAuth: (user: UserAdmin, permissions: string[]) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            permissions: [],
            isAuthenticated: false,
            setAuth: (user, permissions) => set({ user, permissions, isAuthenticated: true }),
            logout: () => set({ user: null, permissions: [], isAuthenticated: false }),
        }),
        {
            name: 'cospabi-auth-storage',
        }
    )
);
