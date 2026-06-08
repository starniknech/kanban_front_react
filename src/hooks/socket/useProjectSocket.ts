import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RealtimeService } from '../../services/RealtimeService';
import { TokenService } from '../../services/TokenService';
import { useInvitationSocketEvents } from './useInvitationSocketEvents';
import { useParticipantSocketEvents } from './useParticipantSocketEvents';
import { useProjectSocketEvents } from './useProjectSocketEvents';
import { useProjectSocketJoin } from './useProjectSocketJoin';
import { useTaskSocketEvents } from './useTaskSocketEvents';

export function useProjectSocket(projectId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = TokenService.getAccessToken();

    if (!projectId || !token) {
      setSocket(null);
      RealtimeService.setProjectSocket(null);
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
    RealtimeService.setProjectSocket(nextSocket);

    return () => {
      RealtimeService.clearProjectSocket(nextSocket);
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [projectId]);

  useProjectSocketJoin(socket, projectId);
  useProjectSocketEvents(socket);
  useTaskSocketEvents(socket);
  useParticipantSocketEvents(socket);
  useInvitationSocketEvents(socket, { includeProjectInvitations: true });

  return socket;
}
