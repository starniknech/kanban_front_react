import { create } from 'zustand';
import { AuthService, LoginPayload, RegisterPayload, RegisterWithAvatarPayload } from '../services/AuthService';
import { TokenService } from '../services/TokenService';
import { UsersService } from '../services/UsersService';
import { AuthTokens, User } from '../types/domain';
import { getEntityId } from '../utils/entity';
import { getErrorMessage } from '../utils/errors';
import { useNotificationStore } from './notificationStore';

interface AuthState {
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterWithAvatarPayload) => Promise<{ avatarUploadFailed: boolean }>;
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name?: string; avatar?: File }) => Promise<User>;
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

  register: async ({ avatar, ...payload }) => {
    const tokens = await AuthService.register(payload as RegisterPayload);
    TokenService.setTokens(tokens);
    let user = await UsersService.getMe();
    let avatarUploadFailed = false;

    if (avatar && getEntityId(user)) {
      try {
        user = await UsersService.updateUser(getEntityId(user), { avatar });
      } catch (error) {
        avatarUploadFailed = true;
        useNotificationStore.getState().showError(
          getErrorMessage(error, 'Account created, but avatar upload failed. You can retry in settings.'),
        );
      }
    }

    set({ user, isAuthenticated: true, isBootstrapping: false });
    return { avatarUploadFailed };
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

  updateProfile: async (payload) => {
    const currentUser = useAuthStore.getState().user;
    const userId = getEntityId(currentUser);

    if (!userId) {
      throw new Error('User is not loaded');
    }

    const user = await UsersService.updateUser(userId, payload);
    set({ user, isAuthenticated: true });
    return user;
  },
}));
