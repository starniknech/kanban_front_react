import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { TokenService } from '../../services/TokenService';
import { useParticipantSocketEvents } from './useParticipantSocketEvents';
import { useProjectSocketJoin } from './useProjectSocketJoin';
import { useTaskSocketEvents } from './useTaskSocketEvents';

export function useProjectSocket(projectId?: string) {
  const socket = useMemo(() => {
    const token = TokenService.getAccessToken();

    if (!projectId || !token) return null;

    return io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      autoConnect: true,
    });
  }, [projectId]);

  useProjectSocketJoin(socket, projectId);
  useTaskSocketEvents(socket);
  useParticipantSocketEvents(socket);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return socket;
}
