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
  return !(err instanceof HttpErrorResponse) || err.status === 0 || err.status >= 500;
}

export interface EventAccessRequirement {
  roles?: string[];
  permissions?: string[];
}

// Gates an event workspace by the caller's effective backend permissions
// (and, where a permission is shared, by role). A route passes when every
// requirement it declares is satisfied.
export const eventAccessGuard =
  (requirement: EventAccessRequirement): CanActivateFn =>
  (route, state) => {
    const access = inject(EventRoleService);
    const router = inject(Router);
    const notification = inject(NotificationService);
    const eventId = eventIdFrom(route);
    if (!eventId) return router.createUrlTree(['/']);

    const loadAccess = () =>
      access
        .getMyPermissions(eventId)
        .pipe(
          catchError((err) =>
            isTransient(err)
              ? timer(600).pipe(switchMap(() => access.getMyPermissions(eventId)))
              : throwError(() => err)
          )
        );

    return loadAccess().pipe(
      map((response) => {
        const roles = (response.data?.roles ?? []).map((name) => name.toLowerCase());
        const permissions = (response.data?.permissions ?? []).map((name) => name.toLowerCase());

        const requiredRoles = (requirement.roles ?? []).map((name) => name.toLowerCase());
        const requiredPermissions = (requirement.permissions ?? []).map((name) =>
          name.toLowerCase()
        );

        const rolesMatch =
          requiredRoles.length === 0 || requiredRoles.some((name) => roles.includes(name));
        const permissionsMatch =
          requiredPermissions.length === 0 ||
          requiredPermissions.some((name) => permissions.includes(name));

        if (rolesMatch && permissionsMatch) return true;

        notification.error("You don't have access to this event workspace.");
        return router.createUrlTree(['/']);
      }),
      catchError((err) => {
        // The session expired: go to login (without an error toast) so the user
        // is refreshed or signed in and returned to this page.
        if (err instanceof HttpErrorResponse && err.status === 401) {
          const returnUrl = state?.url;
          return of(
            returnUrl
              ? router.createUrlTree(['/login'], { queryParams: { returnUrl } })
              : router.createUrlTree(['/login'])
          );
        }

        // The server already said this user has no access on this event, so
        // show the clear message instead of a verification error.
        if (err instanceof HttpErrorResponse && err.status === 403) {
          notification.error("You don't have access to this event workspace.");
          return of(router.createUrlTree(['/']));
        }

        notification.error("Couldn't verify your access. Please try again.");
        return of(router.createUrlTree(['/']));
      })
    );
  };
