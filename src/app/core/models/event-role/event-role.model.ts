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
