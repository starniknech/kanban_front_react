export type EntityId = string;

export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum InvitationRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum RealtimeEvent {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_MOVED = 'task.moved',
  PARTICIPANT_ROLES_UPDATED = 'participant.roles_updated',
}

export interface Entity {
  _id?: EntityId;
  id?: EntityId;
}

export interface User extends Entity {
  name: string;
  email: string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Project extends Entity {
  name: string;
  description?: string | null;
  ownerId: EntityId;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProject extends Entity {
  userId: EntityId | User;
  projectId: EntityId | Project;
  role: ProjectRole[];
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invitation extends Entity {
  projectId: EntityId | Project;
  invitedByUserId: EntityId | User;
  invitedUserId?: EntityId | User | null;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  declinedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task extends Entity {
  projectId: EntityId;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  createdByUserId: EntityId;
  assignedToUserId?: EntityId | null;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  position?: number;
  assignedToUserId?: string;
  dueDate?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface MoveTaskPayload {
  status?: TaskStatus;
  position?: number;
}
