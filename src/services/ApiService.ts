import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthTokens } from '../types/domain';
import { TokenService } from './TokenService';

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export class ApiService {
  static apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  static instance: AxiosInstance = axios.create({
    baseURL: ApiService.apiUrl,
  });

  static setupInterceptors() {
    ApiService.instance.interceptors.request.use((config) => {
      const token = TokenService.getAccessToken();

      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }

      return config;
    });

    ApiService.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const requestUrl = originalRequest?.url || '';
        const isAuthRequest = requestUrl.startsWith('/auth/');

        if (
          error.response?.status !== 401 ||
          !originalRequest ||
          originalRequest._retry ||
          isAuthRequest
        ) {
          return Promise.reject(error);
        }

        const refreshToken = TokenService.getRefreshToken();

        if (!refreshToken) {
          TokenService.clearTokens();
          window.location.assign('/login');
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const { data } = await axios.post<AuthTokens>(ApiService.apiUrl + '/auth/refresh', {
            refreshToken,
          });
          TokenService.setTokens(data);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: 'Bearer ' + data.accessToken,
          };

          return ApiService.instance(originalRequest);
        } catch (refreshError) {
          TokenService.clearTokens();
          window.location.assign('/login');
          return Promise.reject(refreshError);
        }
      },
    );
  }
}

ApiService.setupInterceptors();
