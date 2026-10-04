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

export type UserRole = 'Owner' | 'Organizer' | 'Photographer' | 'AttendanceStaff';

export const eventRoleGuard = (requiredRole: UserRole): CanActivateFn => route => {
  const roles = inject(EventRoleService);
  const router = inject(Router);
  const eventId = eventIdFrom(route);
  if (!eventId) return router.createUrlTree(['/']);

  return roles.getMyRoles(eventId).pipe(
    map(response => {
      const names = (response.data ?? []).map(x => x.roleName.toLowerCase());
      const isOwner = names.includes('owner');
      const allowed =
        names.includes(requiredRole.toLowerCase()) ||
        ((requiredRole === 'Organizer' || requiredRole === 'AttendanceStaff') && isOwner);
      if (allowed) return true;
      if (isOwner) return router.createUrlTree(['/owner', eventId]);
      return router.createUrlTree(['/']);
    }),
    catchError(() => of(router.createUrlTree(['/']))),
  );
};
