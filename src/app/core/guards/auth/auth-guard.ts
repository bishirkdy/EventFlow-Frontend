import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR, allow the route to render.
  if (isPlatformServer(platformId)) {
    return true;
  }

  // The user is already authenticated.
  if (authService.currentUser()) {
    return true;
  }

  // Preserve the URL the user originally attempted to access.
  const loginUrl = router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url,
    },
  });

  return authService.loadCurrentUser().pipe(
    map((user) => (user ? true : loginUrl)),
    catchError(() => of(loginUrl)),
  );
};