import { Entity, ProjectRole, User, UserProject } from '../types/domain';

export function getEntityId(entity?: Entity | string | null): string {
  if (!entity) return '';
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || '';
}

export function hasRole(roles: ProjectRole[] | undefined, role: ProjectRole) {
  return Boolean(roles?.includes(role));
}

export function getMemberUser(member: UserProject): User | null {
  return typeof member.userId === 'object' ? member.userId : null;
}

export function getMemberUserId(member: UserProject): string {
  return typeof member.userId === 'object' ? getEntityId(member.userId) : member.userId;
}

export function getCurrentMembership(members: UserProject[], userId?: string) {
  if (!userId) return undefined;
  return members.find((member) => getMemberUserId(member) === userId);
}
