import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useProjectsStore } from '../../store/projectsStore';
import { OnlineProjectUser } from '../../types/domain';

interface ProjectJoinAck {
  projectId: string;
  onlineUsers?: OnlineProjectUser[];
}

export function useProjectSocketJoin(socket: Socket | null, projectId?: string) {
  const setOnlineUsers = useProjectsStore((state) => state.setOnlineUsers);

  useEffect(() => {
    if (!socket || !projectId) return;

    const join = () =>
      socket.emit('project.join', { projectId }, (ack: ProjectJoinAck) => {
        if (ack.onlineUsers) setOnlineUsers(ack.onlineUsers);
      });

    socket.on('connect', join);

    if (socket.connected) {
      join();
    }

    return () => {
      socket.emit('project.leave', { projectId }, (ack: ProjectJoinAck) => {
        setOnlineUsers(ack.onlineUsers || []);
      });
      socket.off('connect', join);
    };
  }, [projectId, setOnlineUsers, socket]);
}
