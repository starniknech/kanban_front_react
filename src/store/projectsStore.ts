import { create } from 'zustand';
import { ProjectsService } from '../services/ProjectsService';
import { RealtimeService } from '../services/RealtimeService';
import { OnlineProjectUser, Project, ProjectRole, RealtimeEmitEvent, UserProject } from '../types/domain';
import { getEntityId, getMemberUserId } from '../utils/entity';
import { getErrorMessage } from '../utils/errors';
import { useNotificationStore } from './notificationStore';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  members: UserProject[];
  onlineUsers: OnlineProjectUser[];
  deletedProjectId: string | null;
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
  removeMemberById: (member: UserProject | { id?: string; _id?: string; userId?: string } | string | null) => void;
  upsertProject: (project: Project | null) => void;
  removeProject: (project: Project | string | null) => void;
  setOnlineUsers: (users: OnlineProjectUser[]) => void;
  upsertOnlineUsers: (users: OnlineProjectUser[]) => void;
}

function isSameOnlineUser(first: OnlineProjectUser, second: OnlineProjectUser) {
  return first.membershipId === second.membershipId || first.userId === second.userId;
}

function mergeOnlineUsers(currentUsers: OnlineProjectUser[], nextUsers: OnlineProjectUser[]) {
  return nextUsers.reduce<OnlineProjectUser[]>((acc, onlineUser) => {
    const index = acc.findIndex((item) => isSameOnlineUser(item, onlineUser));

    if (index === -1) {
      return [...acc, onlineUser];
    }

    return acc.map((item, itemIndex) => (itemIndex === index ? onlineUser : item));
  }, currentUsers);
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProject: null,
  members: [],
  onlineUsers: [],
  deletedProjectId: null,
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
      set({ currentProject, deletedProjectId: null, isLoading: false });
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
    const project = payload.name
      ? await RealtimeService.emitProject<Project | null>(RealtimeEmitEvent.PROJECT_RENAME, {
        projectId,
        name: payload.name,
      })
      : await ProjectsService.updateProject(projectId, payload);

    if (!project) throw new Error('Project was not updated');
    get().upsertProject(project);
    return project;
  },

  deleteProject: async (projectId) => {
    const project = await RealtimeService.emitProject<Project | null>(RealtimeEmitEvent.PROJECT_DELETE, { projectId });
    get().removeProject(project || projectId);
  },

  updateMemberRoles: async (projectId, memberId, role) => {
    const member = await RealtimeService.emitProject<UserProject>(RealtimeEmitEvent.PARTICIPANT_ROLES_UPDATE, {
      projectId,
      memberId,
      role,
    });
    get().upsertMember(member);
  },

  removeMember: async (projectId, memberId) => {
    const member = await RealtimeService.emitProject<UserProject | null>(RealtimeEmitEvent.PARTICIPANT_REMOVE, {
      projectId,
      memberId,
    });
    get().removeMemberById(member || memberId);
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

  removeMemberById: (member) => {
    if (!member) return;

    const memberId = typeof member === 'string' ? member : getEntityId(member);
    const userId = typeof member === 'string' ? member : member.userId;
    const memberUserId = typeof userId === 'string' ? userId : getEntityId(userId);

    set({
      members: get().members.filter((item) => {
        const itemId = getEntityId(item);
        const itemUserId = getMemberUserId(item);
        return itemId !== memberId && itemUserId !== memberId && itemUserId !== memberUserId;
      }),
    });
  },

  upsertProject: (project) => {
    if (!project) return;
    const projectId = getEntityId(project);
    const exists = get().projects.some((item) => getEntityId(item) === projectId);
    set({
      deletedProjectId: null,
      currentProject: getEntityId(get().currentProject) === projectId ? project : get().currentProject,
      projects: exists
        ? get().projects.map((item) => (getEntityId(item) === projectId ? project : item))
        : [project, ...get().projects],
    });
  },

  removeProject: (project) => {
    if (!project) return;
    const projectId = typeof project === 'string' ? project : getEntityId(project);

    set({
      deletedProjectId: projectId,
      currentProject: getEntityId(get().currentProject) === projectId ? null : get().currentProject,
      projects: get().projects.filter((item) => getEntityId(item) !== projectId),
    });
  },

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  upsertOnlineUsers: (onlineUsers) => set({ onlineUsers: mergeOnlineUsers(get().onlineUsers, onlineUsers) }),
}));
