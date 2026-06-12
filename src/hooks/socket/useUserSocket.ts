import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RealtimeService } from '../../services/RealtimeService';
import { TokenService } from '../../services/TokenService';
import { useInvitationSocketEvents } from './useInvitationSocketEvents';
import { useRealtimeErrorEvents } from './useRealtimeErrorEvents';

export function useUserSocket(enabled: boolean) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = TokenService.getAccessToken();

    if (!enabled || !token) {
      setSocket(null);
      RealtimeService.setUserSocket(null);
      return;
    }

    const nextSocket = io(
      process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000',
      {
        auth: { token },
        autoConnect: true,
        forceNew: true,
        transports: ['websocket'],
      },
    );

    setSocket(nextSocket);
    RealtimeService.setUserSocket(nextSocket);

    return () => {
      RealtimeService.clearUserSocket(nextSocket);
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [enabled]);

  useInvitationSocketEvents(socket, { includeMyInvitations: true });
  useRealtimeErrorEvents(socket);

  return socket;
}
