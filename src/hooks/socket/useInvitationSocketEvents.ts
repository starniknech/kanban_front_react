import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useInvitationsStore } from '../../store/invitationsStore';
import { useProjectsStore } from '../../store/projectsStore';
import { Invitation, RealtimeEvent } from '../../types/domain';

export function useInvitationSocketEvents(
  socket: Socket | null,
  options: { includeMyInvitations?: boolean; includeProjectInvitations?: boolean; projectId?: string } = {
    includeProjectInvitations: true,
  },
) {
  const upsertMyInvitation = useInvitationsStore((state) => state.upsertMyInvitation);
  const upsertProjectInvitation = useInvitationsStore((state) => state.upsertProjectInvitation);
  const removeMyInvitation = useInvitationsStore((state) => state.removeMyInvitation);
  const removeProjectInvitation = useInvitationsStore((state) => state.removeProjectInvitation);
  const fetchMembers = useProjectsStore((state) => state.fetchMembers);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (invitation: Invitation | null) => {
      console.log('handleCreated', invitation)
      
      if (options.includeMyInvitations) upsertMyInvitation(invitation);
      if (options.includeProjectInvitations) upsertProjectInvitation(invitation);
    };
    const handleUpdated = (invitation: Invitation | null) => {
      if (options.includeMyInvitations) upsertMyInvitation(invitation);
      if (options.includeProjectInvitations) upsertProjectInvitation(invitation);
    };
    const handleResolved = (invitation: Invitation | null) => {
      if (options.includeMyInvitations) removeMyInvitation(invitation);
      if (options.includeProjectInvitations) removeProjectInvitation(invitation);
    };
    const handleAccepted = (invitation: Invitation | null) => {
      handleResolved(invitation);
      if (options.projectId) fetchMembers(options.projectId);
    };

    socket.on(RealtimeEvent.INVITATION_CREATED, handleCreated);
    socket.on(RealtimeEvent.INVITATION_UPDATED, handleUpdated);
    socket.on(RealtimeEvent.INVITATION_ACCEPTED, handleAccepted);
    socket.on(RealtimeEvent.INVITATION_DECLINED, handleResolved);
    socket.on(RealtimeEvent.INVITATION_CANCELLED, handleResolved);

    return () => {
      socket.off(RealtimeEvent.INVITATION_CREATED, handleCreated);
      socket.off(RealtimeEvent.INVITATION_UPDATED, handleUpdated);
      socket.off(RealtimeEvent.INVITATION_ACCEPTED, handleAccepted);
      socket.off(RealtimeEvent.INVITATION_DECLINED, handleResolved);
      socket.off(RealtimeEvent.INVITATION_CANCELLED, handleResolved);
    };
  }, [fetchMembers, options.includeMyInvitations, options.includeProjectInvitations, options.projectId, removeMyInvitation, removeProjectInvitation, socket, upsertMyInvitation, upsertProjectInvitation]);
}
