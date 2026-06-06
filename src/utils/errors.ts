import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[]; error?: string }>;
  const message = axiosError.response?.data?.message;

  if (Array.isArray(message)) return message.join(', ');
  if (message) return message;
  if (axiosError.response?.data?.error) return axiosError.response.data.error;
  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
