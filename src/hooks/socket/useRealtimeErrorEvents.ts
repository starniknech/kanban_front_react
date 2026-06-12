import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useNotificationStore } from '../../store/notificationStore';
import { ErrorPayload, RealtimeEvent } from '../../types/domain';

function isErrorPayload(payload: unknown): payload is ErrorPayload {
  return Boolean(
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof (payload as { message?: unknown }).message === 'string',
  );
}

export function useRealtimeErrorEvents(socket: Socket | null) {
  const showError = useNotificationStore((state) => state.showError);

  useEffect(() => {
    if (!socket) return;

    const handleError = (payload: ErrorPayload) => {
      if (isErrorPayload(payload)) showError(payload.message);
    };

    socket.on(RealtimeEvent.ERROR, handleError);

    return () => {
      socket.off(RealtimeEvent.ERROR, handleError);
    };
  }, [showError, socket]);
}
