import { AlertColor } from '@mui/material';
import { create } from 'zustand';

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  showNotification: (message: string, severity?: AlertColor) => void;
  showError: (message: string) => void;
  closeNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  open: false,
  message: '',
  severity: 'info',

  showNotification: (message, severity = 'info') => set({ open: true, message, severity }),
  showError: (message) => set({ open: true, message, severity: 'error' }),
  closeNotification: () => set({ open: false }),
}));
