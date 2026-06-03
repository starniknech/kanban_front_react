import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useProjectsStore } from '../../store/projectsStore';
import { RealtimeEvent, UserProject } from '../../types/domain';

export function useParticipantSocketEvents(socket: Socket | null) {
  const upsertMember = useProjectsStore((state) => state.upsertMember);

  useEffect(() => {
    if (!socket) return;

    const handleRolesUpdate = (member: UserProject) => upsertMember(member);

    socket.on(RealtimeEvent.PARTICIPANT_ROLES_UPDATED, handleRolesUpdate);

    return () => {
      socket.off(RealtimeEvent.PARTICIPANT_ROLES_UPDATED, handleRolesUpdate);
    };
  }, [socket, upsertMember]);
}
