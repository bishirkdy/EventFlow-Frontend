import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/ui/notification.service';

// Restricts the admin console to platform administrators.
export const platformAdminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);
  const platformId = inject(PLATFORM_ID);

  // During SSR, allow the route to render.
  if (isPlatformServer(platformId)) {
    return true;
  }

  const deny = () => {
    notification.error("You don't have access to the admin console.");
    return router.createUrlTree(['/']);
  };

  // The profile is already loaded: decide straight away.
  if (authService.currentUser()) {
    return authService.isPlatformAdmin() ? true : deny();
  }

  // Otherwise probe the profile before refusing access.
  return authService.loadCurrentUser().pipe(
    map((user) => (user?.isPlatformAdmin ? true : deny())),
    catchError(() =>
      of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })),
    ),
  );
};
