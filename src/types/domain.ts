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

export enum NotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
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
  ERROR = 'error',
  DASHBOARD_INVITATIONS = 'dashboard.invitations',
  PROJECT_ONLINE_USERS = 'project.online_users',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_RENAMED = 'project.renamed',
  PROJECT_DELETED = 'project.deleted',
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_MOVED = 'task.moved',
  PARTICIPANT_ROLES_UPDATED = 'participant.roles_updated',
  PARTICIPANT_REMOVED = 'participant.removed',
  INVITATION_CREATED = 'invitation.created',
  INVITATION_UPDATED = 'invitation.updated',
  INVITATION_ACCEPTED = 'invitation.accepted',
  INVITATION_DECLINED = 'invitation.declined',
  INVITATION_CANCELLED = 'invitation.cancelled',
}

export enum RealtimeEmitEvent {
  DASHBOARD_JOIN = 'dashboard.join',
  DASHBOARD_LEAVE = 'dashboard.leave',
  PROJECT_RENAME = 'project.rename',
  PROJECT_DELETE = 'project.delete',
  PARTICIPANT_ROLES_UPDATE = 'participant.roles.update',
  PARTICIPANT_REMOVE = 'participant.remove',
  TASK_CREATE = 'task.create',
  TASK_UPDATE = 'task.update',
  TASK_MOVE = 'task.move',
  TASK_DELETE = 'task.delete',
  INVITATION_CREATE = 'invitation.create',
  INVITATION_UPDATE_NOTIFICATION_STATUS = 'invitation.update_notification_status',
  INVITATION_UPDATE = 'invitation.update',
  INVITATION_ACCEPT = 'invitation.accept',
  INVITATION_DECLINE = 'invitation.decline',
  INVITATION_CANCEL = 'invitation.cancel',
  INVITATION_DELETE = 'invitation.delete',
}

export interface Entity {
  _id?: EntityId;
  id?: EntityId;
}

export type ErrorEnum = 'PENDING_INVITATION_ALREADY_EXISTS' | 'USER_ALREADY_PROJECT_MEMBER';

export type ErrorMessageEnum =
  | 'User already has a pending invitation to this project'
  | 'User is already a project member';

export interface ErrorPayload {
  error: ErrorEnum;
  message: ErrorMessageEnum;
  statusCode: number;
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
  notificationStatus: NotificationStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  declinedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnlineProjectUser {
  userId: EntityId;
  membershipId: EntityId;
  name?: string;
  email?: string;
  avatar?: string;
  socketCount: number;
}

export interface Task extends Entity {
  projectId: EntityId;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  createdByUserId: EntityId;
  assignees: UserProject[];
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
  assignees?: string[];
  dueDate?: string | Date;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface MoveTaskPayload {
  status?: TaskStatus;
  position?: number;
}
