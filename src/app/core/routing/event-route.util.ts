import { EventRoleModel } from '../models/event-role';

export const eventWorkspaceUrl = (eventId: string, ...segments: string[]) => [
  '/organizer',
  eventId,
  ...segments
];

export const participantEventUrl = (eventId: string, ...segments: string[]) => [
  '/participant',
  eventId,
  ...segments
];

// Owners win over every other role, so the order below is the precedence:
// owner, attendance staff, photographer, organizer, then plain participants.
export const workspaceUrlForRoles = (eventId: string, roles: EventRoleModel[]): string[] | null => {
  const names = roles.map((role) => role.roleName.trim().toLowerCase());

  if (names.length === 0) {
    return null;
  }

  if (names.includes('owner')) {
    return ['/owner', eventId];
  }

  if (names.includes('attendancestaff')) {
    return ['/attendance-staff', eventId];
  }

  if (names.includes('photographer')) {
    return ['/photographer', eventId, 'photos'];
  }

  if (names.includes('organizer') || names.includes('eventadmin')) {
    return ['/organizer', eventId, 'overview'];
  }

  return ['/events', eventId];
};
