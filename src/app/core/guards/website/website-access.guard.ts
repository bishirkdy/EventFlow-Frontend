import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { EventRoleService } from '../../services/event-role/event-role.service';

// Roles allowed to look at a website before the event is published.
const PREVIEW_ROLES = ['owner', 'organizer', 'eventadmin'];

// The public website stays open, but preview mode (?preview=1) is limited to
// the roles that manage the event. The backend enforces the same rule.
export const websiteAccessGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const roleService = inject(EventRoleService);

  const isPreview = route.queryParamMap.get('preview') === '1';
  if (!isPreview) {
    return true;
  }

  // Preview data needs the session cookie, which the server never has.
  if (isPlatformServer(platformId)) {
    return true;
  }

  const eventId = route.paramMap.get('eventId');
  if (!eventId) {
    return router.createUrlTree(['/']);
  }

  const loginUrl = router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });

  return roleService.getMyRoles(eventId).pipe(
    map((response) => {
      const names = (response.data ?? []).map((role) => role.roleName.toLowerCase());
      const allowed = names.some((name) => PREVIEW_ROLES.includes(name));
      return allowed ? true : router.createUrlTree(['/']);
    }),
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return of(loginUrl);
      }
      return of(router.createUrlTree(['/']));
    }),
  );
};
