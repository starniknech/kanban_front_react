import { ApiService } from './ApiService';
import { AuthTokens } from '../types/domain';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface RegisterWithAvatarPayload extends RegisterPayload {
  avatar?: File;
}

export class AuthService {
  static async login(payload: LoginPayload) {
    const { data } = await ApiService.instance.post<AuthTokens>('/auth/login', payload);
    return data;
  }

  static async register(payload: RegisterPayload) {
    const { data } = await ApiService.instance.post<AuthTokens>('/auth/register', payload);
    return data;
  }

  static async refresh(refreshToken: string) {
    const { data } = await ApiService.instance.post<AuthTokens>('/auth/refresh', { refreshToken });
    return data;
  }

  static async logout(refreshToken: string) {
    const { data } = await ApiService.instance.post<{ success: boolean }>('/auth/logout', {
      refreshToken,
    });
    return data;
  }
}
