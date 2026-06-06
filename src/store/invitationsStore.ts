import { create } from 'zustand';
import { InvitationsService } from '../services/InvitationsService';
import { Invitation, InvitationRole, InvitationStatus, NotificationStatus } from '../types/domain';
import { getEntityId } from '../utils/entity';
import { getErrorMessage } from '../utils/errors';
import { useNotificationStore } from './notificationStore';

interface InvitationsState {
  invitations: Invitation[];
  projectInvitations: Invitation[];
  isLoading: boolean;
  fetchMyInvitations: () => Promise<void>;
  fetchProjectInvitations: (projectId: string) => Promise<void>;
  createInvitation: (projectId: string, payload: { email: string; role: InvitationRole }) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (projectId: string, invitationId: string) => Promise<void>;
  markInvitationNotificationStatus: (invitationId: string, notificationStatus: NotificationStatus) => Promise<void>;
  markUnreadInvitationsRead: () => Promise<void>;
  upsertMyInvitation: (invitation: Invitation | null) => void;
  upsertProjectInvitation: (invitation: Invitation | null) => void;
  removeMyInvitation: (invitation: Invitation | string | null) => void;
  removeProjectInvitation: (invitation: Invitation | string | null) => void;
}

export const useInvitationsStore = create<InvitationsState>((set, get) => ({
  invitations: [],
  projectInvitations: [],
  isLoading: false,

  fetchMyInvitations: async () => {
    set({ isLoading: true });
    const invitations = await InvitationsService.listMyInvitations();
    set({ invitations, isLoading: false });
  },

  fetchProjectInvitations: async (projectId) => {
    const projectInvitations = await InvitationsService.listProjectInvitations(projectId);
    set({ projectInvitations });
  },

  createInvitation: async (projectId, payload) => {
    const invitation = await InvitationsService.createInvitation(projectId, payload);
    set({ projectInvitations: [invitation, ...get().projectInvitations] });
  },

  acceptInvitation: async (invitationId) => {
    await InvitationsService.acceptInvitation(invitationId);
    set({ invitations: get().invitations.filter((item) => getEntityId(item) !== invitationId) });
  },

  declineInvitation: async (invitationId) => {
    await InvitationsService.declineInvitation(invitationId);
    set({ invitations: get().invitations.filter((item) => getEntityId(item) !== invitationId) });
  },

  cancelInvitation: async (projectId, invitationId) => {
    await InvitationsService.cancelInvitation(projectId, invitationId);
    set({ projectInvitations: get().projectInvitations.filter((item) => getEntityId(item) !== invitationId) });
  },

  markInvitationNotificationStatus: async (invitationId, notificationStatus) => {
    const invitation = await InvitationsService.updateNotificationStatus(invitationId, notificationStatus);
    get().upsertMyInvitation(invitation);
  },

  markUnreadInvitationsRead: async () => {
    const unreadInvitations = get().invitations.filter(
      (invitation) =>
        invitation.status === InvitationStatus.PENDING &&
        invitation.notificationStatus === NotificationStatus.UNREAD,
    );

    try {
      await Promise.all(
        unreadInvitations.map((invitation) =>
          get().markInvitationNotificationStatus(getEntityId(invitation), NotificationStatus.READ),
        ),
      );
    } catch (error) {
      useNotificationStore.getState().showError(
        getErrorMessage(error, 'Failed to mark invitations as read'),
      );
      throw error;
    }
  },

  upsertMyInvitation: (invitation) => {
    if (!invitation) return;
    const invitationId = getEntityId(invitation);
    const shouldKeep = invitation.status === InvitationStatus.PENDING;
    const exists = get().invitations.some((item) => getEntityId(item) === invitationId);

    if (!shouldKeep) {
      get().removeMyInvitation(invitationId);
      return;
    }

    set({
      invitations: exists
        ? get().invitations.map((item) => (getEntityId(item) === invitationId ? invitation : item))
        : [invitation, ...get().invitations],
    });
  },

  upsertProjectInvitation: (invitation) => {
    if (!invitation) return;
    const invitationId = getEntityId(invitation);
    const exists = get().projectInvitations.some((item) => getEntityId(item) === invitationId);
    set({
      projectInvitations: exists
        ? get().projectInvitations.map((item) => (getEntityId(item) === invitationId ? invitation : item))
        : [invitation, ...get().projectInvitations],
    });
  },

  removeMyInvitation: (invitation) => {
    if (!invitation) return;
    const invitationId = typeof invitation === 'string' ? invitation : getEntityId(invitation);
    set({ invitations: get().invitations.filter((item) => getEntityId(item) !== invitationId) });
  },

  removeProjectInvitation: (invitation) => {
    if (!invitation) return;
    const invitationId = typeof invitation === 'string' ? invitation : getEntityId(invitation);
    set({ projectInvitations: get().projectInvitations.filter((item) => getEntityId(item) !== invitationId) });
  },
}));
