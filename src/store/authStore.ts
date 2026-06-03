import { create } from 'zustand';
import { AuthService, LoginPayload, RegisterPayload } from '../services/AuthService';
import { TokenService } from '../services/TokenService';
import { UsersService } from '../services/UsersService';
import { AuthTokens, User } from '../types/domain';
import { getEntityId } from '../utils/entity';

interface AuthState {
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isBootstrapping: true,
  isAuthenticated: TokenService.hasTokens(),

  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),

  setTokens: (tokens) => {
    TokenService.setTokens(tokens);
    set({ isAuthenticated: true });
  },

  login: async (payload) => {
    const tokens = await AuthService.login(payload);
    TokenService.setTokens(tokens);
    const user = await UsersService.getMe();
    set({ user, isAuthenticated: true, isBootstrapping: false });
  },

  register: async (payload) => {
    const tokens = await AuthService.register(payload);
    TokenService.setTokens(tokens);
    const user = await UsersService.getMe();
    set({ user, isAuthenticated: true, isBootstrapping: false });
  },

  bootstrap: async () => {
    if (!TokenService.hasTokens()) {
      set({ user: null, isAuthenticated: false, isBootstrapping: false });
      return;
    }

    try {
      const user = await UsersService.getMe();
      set({ user, isAuthenticated: Boolean(getEntityId(user)), isBootstrapping: false });
    } catch {
      TokenService.clearTokens();
      set({ user: null, isAuthenticated: false, isBootstrapping: false });
    }
  },

  logout: async () => {
    const refreshToken = TokenService.getRefreshToken();

    if (refreshToken) {
      await AuthService.logout(refreshToken).catch(() => undefined);
    }

    TokenService.clearTokens();
    set({ user: null, isAuthenticated: false, isBootstrapping: false });
  },
}));
