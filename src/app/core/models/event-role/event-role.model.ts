export interface EventRoleModel {
  id: string;
  roleId: string;
  roleName: string;
  eventId: string;
}

export interface EventTeamRoleModel {
  roleId: string;
  roleName: string;
}

export interface EventTeamMemberModel {
  userId: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: EventTeamRoleModel[];
}

export interface TeamRoleCountModel {
  roleId: string;
  roleName: string;
  count: number;
}

export interface TeamAnalyticsModel {
  totalMembers: number;
  owners: number;
  organizers: number;
  others: number;
  assignedLast7Days: number;
  lastAssignedAtUtc: string | null;
  roleBreakdown: TeamRoleCountModel[];
}
