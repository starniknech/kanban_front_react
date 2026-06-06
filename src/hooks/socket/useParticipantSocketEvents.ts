import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useProjectsStore } from '../../store/projectsStore';
import { RealtimeEvent, UserProject } from '../../types/domain';

export function useParticipantSocketEvents(socket: Socket | null) {
  const upsertMember = useProjectsStore((state) => state.upsertMember);
  const removeMemberByUserId = useProjectsStore((state) => state.removeMemberByUserId);

  useEffect(() => {
    if (!socket) return;

    const handleRolesUpdate = (member: UserProject) => upsertMember(member);
    const handleRemoved = (payload: { userId: string }) => removeMemberByUserId(payload.userId);

    socket.on(RealtimeEvent.PARTICIPANT_ROLES_UPDATED, handleRolesUpdate);
    socket.on(RealtimeEvent.PARTICIPANT_REMOVED, handleRemoved);

    return () => {
      socket.off(RealtimeEvent.PARTICIPANT_ROLES_UPDATED, handleRolesUpdate);
      socket.off(RealtimeEvent.PARTICIPANT_REMOVED, handleRemoved);
    };
  }, [removeMemberByUserId, socket, upsertMember]);
}
