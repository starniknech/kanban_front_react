import { ApiService } from './ApiService';
import { Invitation, InvitationRole } from '../types/domain';

export class InvitationsService {
  static async listMyInvitations() {
    const { data } = await ApiService.instance.get<Invitation[]>('/invitations/my');
    return data;
  }

  static async listProjectInvitations(projectId: string) {
    const { data } = await ApiService.instance.get<Invitation[]>('/projects/' + projectId + '/invitations');
    return data;
  }

  static async createInvitation(projectId: string, payload: { email: string; role: InvitationRole }) {
    const { data } = await ApiService.instance.post<Invitation>('/projects/' + projectId + '/invitations', payload);
    return data;
  }

  static async acceptInvitation(invitationId: string) {
    const { data } = await ApiService.instance.patch<Invitation>('/invitations/' + invitationId + '/accept');
    return data;
  }

  static async declineInvitation(invitationId: string) {
    const { data } = await ApiService.instance.patch<Invitation>('/invitations/' + invitationId + '/decline');
    return data;
  }

  static async cancelInvitation(projectId: string, invitationId: string) {
    const { data } = await ApiService.instance.patch<Invitation>(
      '/projects/' + projectId + '/invitations/' + invitationId + '/cancel',
    );
    return data;
  }
}
