import { EventTeamRoleModel } from './event-team-role.model';

export interface EventTeamMemberModel {
  userId: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: EventTeamRoleModel[];
}
