import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap, throwError, timer } from 'rxjs';
import { EventRoleService } from '../../services/event-role/event-role.service';
import { NotificationService } from '../../services/ui/notification.service';

function eventIdFrom(route: ActivatedRouteSnapshot): string | null {
  let current: ActivatedRouteSnapshot | null = route;
  while (current) {
    const id = current.paramMap.get('eventId');
    if (id) return id;
    current = current.parent;
  }
  return null;
}

// Backend restarts and proxy hiccups fail for a moment; those deserve one
// quick retry instead of kicking the user out of the workspace.
function isTransient(err: unknown): boolean {
  return (
    !(err instanceof HttpErrorResponse) ||
    err.status === 0 ||
    err.status >= 500
  );
}

export type UserRole = 'Owner' | 'Organizer' | 'Photographer' | 'AttendanceStaff';

export const eventRoleGuard = (requiredRole: UserRole): CanActivateFn => route => {
  const roles = inject(EventRoleService);
  const router = inject(Router);
  const notification = inject(NotificationService);
  const eventId = eventIdFrom(route);
  if (!eventId) return router.createUrlTree(['/']);

  const loadRoles = () =>
    roles.getMyRoles(eventId).pipe(
      catchError(err =>
        isTransient(err)
          ? timer(600).pipe(switchMap(() => roles.getMyRoles(eventId)))
          : throwError(() => err),
      ),
    );

  return loadRoles().pipe(
    map(response => {
      const names = (response.data ?? []).map(x => x.roleName.toLowerCase());
      const isOwner = names.includes('owner');
      const allowed =
        names.includes(requiredRole.toLowerCase()) ||
        ((
          requiredRole === 'Organizer' ||
          requiredRole === 'AttendanceStaff' ||
          requiredRole === 'Photographer'
        ) && isOwner);
      if (allowed) return true;
      if (isOwner) return router.createUrlTree(['/owner', eventId]);
      notification.error(`You don't have ${requiredRole} access for this event.`);
      return router.createUrlTree(['/']);
    }),
    catchError(err => {
      // The session expired: go to login (without an error toast) so the user
      // is refreshed or signed in and returned to this page.
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return of(
          router.createUrlTree(['/login'], {
            queryParams: { returnUrl: router.url },
          }),
        );
      }

      // The server already said this user has no role on this event, so show
      // the clear access message instead of a verification error.
      if (err instanceof HttpErrorResponse && err.status === 403) {
        notification.error(`You don't have ${requiredRole} access for this event.`);
        return of(router.createUrlTree(['/']));
      }

      notification.error("Couldn't verify your access. Please try again.");
      return of(router.createUrlTree(['/']));
    }),
  );
};
