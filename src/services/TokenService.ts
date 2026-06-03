import { AuthTokens } from '../types/domain';

const ACCESS_TOKEN_KEY = 'kanban_access_token';
const REFRESH_TOKEN_KEY = 'kanban_refresh_token';

export class TokenService {
  static getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static setTokens(tokens: AuthTokens) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  static clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  static hasTokens() {
    return Boolean(this.getAccessToken() && this.getRefreshToken());
  }
}
