import { create } from 'zustand';
import { InvitationsService } from '../services/InvitationsService';
import { Invitation, InvitationRole } from '../types/domain';
import { getEntityId } from '../utils/entity';

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
}));
