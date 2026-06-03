import { useEffect } from 'react';
import { Socket } from 'socket.io-client';

export function useProjectSocketJoin(socket: Socket | null, projectId?: string) {
  useEffect(() => {
    if (!socket || !projectId) return;

    const join = () => socket.emit('project.join', { projectId });

    socket.on('connect', join);

    if (socket.connected) {
      join();
    }

    return () => {
      socket.off('connect', join);
    };
  }, [projectId, socket]);
}
