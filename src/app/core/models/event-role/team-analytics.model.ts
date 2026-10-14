import { TeamRoleCountModel } from './team-role-count.model';

export interface TeamAnalyticsModel {
  totalMembers: number;
  owners: number;
  organizers: number;
  others: number;
  assignedLast7Days: number;
  lastAssignedAtUtc: string | null;
  roleBreakdown: TeamRoleCountModel[];
}
