import { create } from 'zustand';
import { Role, User } from '../api/types';

interface RoleState {
  currentUser: User | null;
  activeRole: Role;
  setUser: (user: User) => void;
  setActiveRole: (role: Role) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  currentUser: {
    id: 'donor1',
    displayName: 'Sharma Wedding Hall',
    email: 'donor@sharma.org',
    roles: ['DONOR', 'RIDER', 'NGO_OPERATOR', 'ADMIN'],
    activeRole: 'DONOR',
  },
  activeRole: 'DONOR',
  setUser: (user) => set({ currentUser: user, activeRole: user.activeRole || user.roles[0] }),
  setActiveRole: (role) => set((state) => ({
    activeRole: role,
    currentUser: state.currentUser ? { ...state.currentUser, activeRole: role } : null,
  })),
}));
