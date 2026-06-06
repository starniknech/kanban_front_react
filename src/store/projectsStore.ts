import { create } from 'zustand';
import { ProjectsService } from '../services/ProjectsService';
import { OnlineProjectUser, Project, ProjectRole, UserProject } from '../types/domain';
import { getEntityId, getMemberUserId } from '../utils/entity';
import { getErrorMessage } from '../utils/errors';
import { useNotificationStore } from './notificationStore';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  members: UserProject[];
  onlineUsers: OnlineProjectUser[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  fetchMembers: (projectId: string) => Promise<void>;
  createProject: (payload: { name: string; description?: string }) => Promise<Project>;
  updateProject: (projectId: string, payload: { name?: string; description?: string }) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  updateMemberRoles: (projectId: string, memberId: string, role: ProjectRole[]) => Promise<void>;
  removeMember: (projectId: string, memberId: string) => Promise<void>;
  upsertMember: (member: UserProject) => void;
  removeMemberByUserId: (userId: string) => void;
  upsertProject: (project: Project | null) => void;
  setOnlineUsers: (users: OnlineProjectUser[]) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProject: null,
  members: [],
  onlineUsers: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await ProjectsService.listProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(error, 'Не удалось загрузить проекты');
      useNotificationStore.getState().showError(message);
      set({ error: message, isLoading: false });
    }
  },

  fetchProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const currentProject = await ProjectsService.getProject(projectId);
      set({ currentProject, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(error, 'Не удалось загрузить проект');
      useNotificationStore.getState().showError(message);
      set({ error: message, isLoading: false });
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

  updateProject: async (projectId, payload) => {
    const project = await ProjectsService.updateProject(projectId, payload);
    get().upsertProject(project);
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

  removeMemberByUserId: (userId) => {
    set({ members: get().members.filter((member) => getMemberUserId(member) !== userId) });
  },

  upsertProject: (project) => {
    if (!project) return;
    const projectId = getEntityId(project);
    const exists = get().projects.some((item) => getEntityId(item) === projectId);
    set({
      currentProject: getEntityId(get().currentProject) === projectId ? project : get().currentProject,
      projects: exists
        ? get().projects.map((item) => (getEntityId(item) === projectId ? project : item))
        : [project, ...get().projects],
    });
  },

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
}));
