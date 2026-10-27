import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, User } from '../api/types';

interface RoleState {
  currentUser: User | null;
  activeRole: Role;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setActiveRole: (role: Role) => void;
  logout: () => void;
}

const DEFAULT_ROLE: Role = 'DONOR';

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      currentUser: null,
      activeRole: DEFAULT_ROLE,
      isAuthenticated: false,
      setUser: (user) =>
        set({
          currentUser: user,
          activeRole: user.activeRole || user.roles[0],
          isAuthenticated: true,
        }),
      setActiveRole: (role) =>
        set((state) => ({
          activeRole: role,
          currentUser: state.currentUser ? { ...state.currentUser, activeRole: role } : null,
        })),
      logout: () =>
        set({
          currentUser: null,
          activeRole: DEFAULT_ROLE,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'lastmileaid-auth', // localStorage key
      partialize: (state) => ({
        currentUser: state.currentUser,
        activeRole: state.activeRole,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
