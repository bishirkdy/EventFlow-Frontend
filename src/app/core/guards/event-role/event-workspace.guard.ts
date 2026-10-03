import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { EventRoleService } from '../../services/event-role/event-role.service';
import { EventContextService } from '../../services/event-context/event-context.service';

function eventIdFrom(route: ActivatedRouteSnapshot): string | null {
  let current: ActivatedRouteSnapshot | null = route;
  while (current) {
    const id = current.paramMap.get('eventId');
    if (id) return id;
    current = current.parent;
  }
  return null;
}

export const eventWorkspaceGuard: CanActivateFn = (route, state) => {
  const roles = inject(EventRoleService);
  const context = inject(EventContextService);
  const router = inject(Router);
  const eventId = eventIdFrom(route);

  if (!eventId) return router.createUrlTree(['/']);

  return roles.getMyRoles(eventId).pipe(
    map((response) => {
      const names = (response.data ?? []).map((role) => role.roleName.trim().toLowerCase());
      const allowed = names.some((name) =>
        ['owner', 'organizer', 'eventadmin'].includes(name),
      );

      if (allowed) {
        // Prime the shared event context after authorization succeeds.
        context.load(eventId).subscribe({ error: () => undefined });
        return true;
      }

      if (names.includes('participant')) {
        return router.createUrlTree(['/participant', eventId, 'overview']);
      }

      return router.createUrlTree(['/my-events'], {
        queryParams: { returnUrl: state.url },
      });
    }),
    catchError(() => of(router.createUrlTree(['/my-events']))),
  );
};
