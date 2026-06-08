import { Alert, Snackbar } from '@mui/material';
import { useNotificationStore } from '../../store/notificationStore';

export function GlobalSnackbar() {
  const open = useNotificationStore((state) => state.open);
  const message = useNotificationStore((state) => state.message);
  const severity = useNotificationStore((state) => state.severity);
  const closeNotification = useNotificationStore((state) => state.closeNotification);

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={closeNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={closeNotification} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
