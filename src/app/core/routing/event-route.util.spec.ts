import { EventRoleModel } from '../models/event-role';
import { workspaceUrlForRoles } from './event-route.util';

function roles(...roleNames: string[]): EventRoleModel[] {
  return roleNames.map((roleName) => ({ roleName }) as EventRoleModel);
}

describe('workspaceUrlForRoles', () => {
  it('routes owners to the owner dashboard', () => {
    expect(workspaceUrlForRoles('evt-1', roles('Owner'))).toEqual(['/owner', 'evt-1']);
  });

  it('routes attendance staff to the scanner workspace', () => {
    expect(workspaceUrlForRoles('evt-1', roles('AttendanceStaff'))).toEqual([
      '/attendance-staff',
      'evt-1',
    ]);
  });

  it('routes photographers to their photo workspace', () => {
    expect(workspaceUrlForRoles('evt-1', roles('Photographer'))).toEqual([
      '/photographer',
      'evt-1',
      'photos',
    ]);
  });

  it('routes organizers to the organizer dashboard', () => {
    expect(workspaceUrlForRoles('evt-1', roles('Organizer'))).toEqual([
      '/organizer',
      'evt-1',
      'overview',
    ]);
  });

  it('opens the public event site for participant-only memberships', () => {
    expect(workspaceUrlForRoles('evt-1', roles('Participant'))).toEqual(['/events', 'evt-1']);
  });

  it('prefers the owner workspace when several roles are held', () => {
    expect(workspaceUrlForRoles('evt-1', roles('Participant', 'Organizer', 'Owner'))).toEqual([
      '/owner',
      'evt-1',
    ]);
  });

  it('ignores role name casing and spacing', () => {
    expect(workspaceUrlForRoles('evt-1', roles('  owner  '))).toEqual(['/owner', 'evt-1']);
  });

  it('returns null when the account has no role on the event', () => {
    expect(workspaceUrlForRoles('evt-1', [])).toBeNull();
  });
});
