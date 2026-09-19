import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR, allow the route to render.
  if (isPlatformServer(platformId)) {
    return true;
  }

  if (authService.currentUser()) {
    return true;
  }

  return authService.loadCurrentUser().pipe(
    map((user) => {
      return user
        ? true
        : router.createUrlTree(['/login']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    }),
  );
};