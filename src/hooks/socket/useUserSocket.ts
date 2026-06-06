import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { TokenService } from '../../services/TokenService';
import { useInvitationSocketEvents } from './useInvitationSocketEvents';

export function useUserSocket(enabled: boolean) {
  const socket = useMemo(() => {
    const token = TokenService.getAccessToken();

    if (!enabled || !token) return null;

    return io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      autoConnect: true,
    });
  }, [enabled]);

  useInvitationSocketEvents(socket, { includeMyInvitations: true });

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return socket;
}
