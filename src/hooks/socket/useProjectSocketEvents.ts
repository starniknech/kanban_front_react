import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useProjectsStore } from '../../store/projectsStore';
import { OnlineProjectUser, Project, RealtimeEvent } from '../../types/domain';

interface OnlineUsersPayload {
  projectId: string;
  users?: OnlineProjectUser[];
  user?: OnlineProjectUser;
  onlineUser?: OnlineProjectUser;
}

export function useProjectSocketEvents(socket: Socket | null) {
  const setOnlineUsers = useProjectsStore((state) => state.setOnlineUsers);
  const upsertOnlineUsers = useProjectsStore((state) => state.upsertOnlineUsers);
  const upsertProject = useProjectsStore((state) => state.upsertProject);
  const removeProject = useProjectsStore((state) => state.removeProject);

  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (payload: OnlineUsersPayload) => {
      if (payload.users) {
        setOnlineUsers(payload.users);
        return;
      }

      const onlineUser = payload.user || payload.onlineUser;
      if (onlineUser) upsertOnlineUsers([onlineUser]);
    };
    const handleProjectUpdate = (project: Project | null) => upsertProject(project);
    const handleProjectDelete = (project: Project | null) => removeProject(project);

    socket.on(RealtimeEvent.PROJECT_ONLINE_USERS, handleOnlineUsers);
    socket.on(RealtimeEvent.PROJECT_UPDATED, handleProjectUpdate);
    socket.on(RealtimeEvent.PROJECT_RENAMED, handleProjectUpdate);
    socket.on(RealtimeEvent.PROJECT_DELETED, handleProjectDelete);

    return () => {
      socket.off(RealtimeEvent.PROJECT_ONLINE_USERS, handleOnlineUsers);
      socket.off(RealtimeEvent.PROJECT_UPDATED, handleProjectUpdate);
      socket.off(RealtimeEvent.PROJECT_RENAMED, handleProjectUpdate);
      socket.off(RealtimeEvent.PROJECT_DELETED, handleProjectDelete);
    };
  }, [removeProject, setOnlineUsers, socket, upsertOnlineUsers, upsertProject]);
}
