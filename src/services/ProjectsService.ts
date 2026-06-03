import { ApiService } from './ApiService';
import { CreateProjectPayload, Project, ProjectRole, UserProject } from '../types/domain';

export class ProjectsService {
  static async listProjects() {
    const { data } = await ApiService.instance.get<Project[]>('/projects');
    return data;
  }

  static async createProject(payload: CreateProjectPayload) {
    const { data } = await ApiService.instance.post<Project>('/projects', payload);
    return data;
  }

  static async getProject(projectId: string) {
    const { data } = await ApiService.instance.get<Project>('/projects/' + projectId);
    return data;
  }

  static async updateProject(projectId: string, payload: Partial<CreateProjectPayload>) {
    const { data } = await ApiService.instance.patch<Project>('/projects/' + projectId, payload);
    return data;
  }

  static async deleteProject(projectId: string) {
    const { data } = await ApiService.instance.delete<Project>('/projects/' + projectId);
    return data;
  }

  static async listMembers(projectId: string) {
    const { data } = await ApiService.instance.get<UserProject[]>('/projects/' + projectId + '/members');
    return data;
  }

  static async updateMemberRoles(projectId: string, memberId: string, role: ProjectRole[]) {
    const { data } = await ApiService.instance.patch<UserProject>(
      '/projects/' + projectId + '/members/' + memberId + '/roles',
      { role },
    );
    return data;
  }

  static async removeMember(projectId: string, memberId: string) {
    const { data } = await ApiService.instance.delete<UserProject>(
      '/projects/' + projectId + '/members/' + memberId,
    );
    return data;
  }
}
