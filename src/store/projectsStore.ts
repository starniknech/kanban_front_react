import { create } from 'zustand';
import { ProjectsService } from '../services/ProjectsService';
import { Project, ProjectRole, UserProject } from '../types/domain';
import { getEntityId } from '../utils/entity';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  members: UserProject[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  fetchMembers: (projectId: string) => Promise<void>;
  createProject: (payload: { name: string; description?: string }) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  updateMemberRoles: (projectId: string, memberId: string, role: ProjectRole[]) => Promise<void>;
  removeMember: (projectId: string, memberId: string) => Promise<void>;
  upsertMember: (member: UserProject) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProject: null,
  members: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await ProjectsService.listProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Не удалось загрузить проекты', isLoading: false });
    }
  },

  fetchProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const currentProject = await ProjectsService.getProject(projectId);
      set({ currentProject, isLoading: false });
    } catch {
      set({ error: 'Не удалось загрузить проект', isLoading: false });
    }
  },

  fetchMembers: async (projectId) => {
    const members = await ProjectsService.listMembers(projectId);
    set({ members });
  },

  createProject: async (payload) => {
    const project = await ProjectsService.createProject(payload);
    set({ projects: [project, ...get().projects] });
    return project;
  },

  deleteProject: async (projectId) => {
    await ProjectsService.deleteProject(projectId);
    set({ projects: get().projects.filter((project) => getEntityId(project) !== projectId) });
  },

  updateMemberRoles: async (projectId, memberId, role) => {
    const member = await ProjectsService.updateMemberRoles(projectId, memberId, role);
    get().upsertMember(member);
  },

  removeMember: async (projectId, memberId) => {
    await ProjectsService.removeMember(projectId, memberId);
    set({ members: get().members.filter((member) => getEntityId(member.userId) !== memberId) });
  },

  upsertMember: (member) => {
    const memberId = getEntityId(member.userId);
    const exists = get().members.some((item) => getEntityId(item.userId) === memberId);
    set({
      members: exists
        ? get().members.map((item) => (getEntityId(item.userId) === memberId ? member : item))
        : [member, ...get().members],
    });
  },
}));
