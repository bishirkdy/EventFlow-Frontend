import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { EventRoleService } from '../../services/event-role/event-role.service';

function eventIdFrom(route: ActivatedRouteSnapshot): string | null {
  let current: ActivatedRouteSnapshot | null = route;
  while (current) {
    const id = current.paramMap.get('eventId');
    if (id) return id;
    current = current.parent;
  }
  return null;
}

export type UserRole = 'Owner' | 'Organizer' | 'AttentionStaff';

export const eventRoleGuard = (requiredRole: UserRole): CanActivateFn => route => {
  const roles = inject(EventRoleService);
  const router = inject(Router);
  const eventId = eventIdFrom(route);
  if (!eventId) return router.createUrlTree(['/']);

  return roles.getMyRoles(eventId).pipe(
    map(response => {
      const names = (response.data ?? []).map(x => x.roleName.toLowerCase());
      const allowed = names.includes(requiredRole.toLowerCase());
      if (allowed) return true;
      const roleMap: Record<string, string> = {
        owner: '/owner',
        organizer: '/organizer',
        attentionstaff: '/',
      };
      return router.createUrlTree([
        roleMap[requiredRole] ?? '/',
        ...(names.includes('owner') || names.includes('organizer') ? [eventId] : []),
      ]);
    }),
    catchError(() => of(router.createUrlTree(['/']))),
  );
};
