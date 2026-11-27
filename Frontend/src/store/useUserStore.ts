import { create } from "zustand";
import { DEFAULT_USER_PROFILE } from "@/data/offers-and-users";
import { authService, userService } from "@/services";
import type { UserProfile } from "@/types/domain";

interface UserStoreState {
  profile: UserProfile;
  isLoaded: boolean;
  isAuthenticated: boolean;
  checkSession: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (input: { name: string; email: string; password: string }) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set) => ({
  profile: DEFAULT_USER_PROFILE,
  isLoaded: false,
  isAuthenticated: false,

  checkSession: async () => {
    const user = await authService.getCurrentUser();
    if (user) {
      set({ profile: user, isAuthenticated: true, isLoaded: true });
    } else {
      set({ isAuthenticated: false, isLoaded: true });
    }
  },

  loadProfile: async () => {
    try {
      const profile = await userService.getDemoProfile();
      set({ profile, isAuthenticated: true, isLoaded: true });
    } catch {
      set({ isAuthenticated: false, isLoaded: true });
    }
  },

  updateProfile: async (patch) => {
    const updated = await userService.updateDemoProfile(patch);
    set({ profile: updated, isLoaded: true });
  },

  login: async (email, password) => {
    const user = await authService.login(email, password);
    set({ profile: user, isAuthenticated: true, isLoaded: true });
    return user;
  },

  register: async (input) => {
    const user = await authService.register(input);
    set({ profile: user, isAuthenticated: true, isLoaded: true });
    return user;
  },

  logout: async () => {
    await authService.logout();
    set({ profile: DEFAULT_USER_PROFILE, isAuthenticated: false, isLoaded: true });
  },
}));
