import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useInvitationsStore } from '../../store/invitationsStore';
import { Invitation, RealtimeEmitEvent, RealtimeEvent } from '../../types/domain';

interface DashboardJoinAck {
  invitations?: Invitation[];
}

interface DashboardInvitationsPayload {
  invitations: Invitation[];
}

export function useDashboardSocketJoin(socket: Socket | null) {
  const replaceMyInvitations = useInvitationsStore((state) => state.replaceMyInvitations);

  useEffect(() => {
    if (!socket) return;

    const join = () => {
      socket.emit(RealtimeEmitEvent.DASHBOARD_JOIN, (ack?: DashboardJoinAck) => {
        if (ack?.invitations) replaceMyInvitations(ack.invitations);
      });
    };

    const handleDashboardInvitations = (payload: DashboardInvitationsPayload) => {
      replaceMyInvitations(payload.invitations);
    };

    socket.on('connect', join);
    socket.on(RealtimeEvent.DASHBOARD_INVITATIONS, handleDashboardInvitations);

    if (socket.connected) {
      join();
    }

    return () => {
      socket.emit(RealtimeEmitEvent.DASHBOARD_LEAVE);
      socket.off('connect', join);
      socket.off(RealtimeEvent.DASHBOARD_INVITATIONS, handleDashboardInvitations);
    };
  }, [replaceMyInvitations, socket]);
}
