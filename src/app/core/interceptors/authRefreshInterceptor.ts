import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import {
  catchError,
  finalize,
  Observable,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

let refreshRequest$: Observable<boolean> | null = null;

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isAuthRequest = /\/v1\/auth\/(login|register|refresh|logout)/i.test(req.url);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isAuthRequest
      ) {
        return throwError(() => error);
      }

      // During SSR there is no session to refresh and redirecting would send
      // every server rendered page (including the public event website) to
      // /login. The client takes over after hydration.
      if (isPlatformServer(platformId)) {
        return throwError(() => error);
      }

      if (!refreshRequest$) {
        refreshRequest$ = auth.refresh().pipe(
          switchMap(refreshed =>
            refreshed
              ? auth.loadCurrentUser().pipe(switchMap(user => [!!user]))
              : [false],
          ),
          finalize(() => {
            refreshRequest$ = null;
          }),
          shareReplay(1),
        );
      }

      const currentRefreshRequest = refreshRequest$;

      const loginUrl = router.createUrlTree(['/login'], {
        queryParams: { returnUrl: router.url },
      });

      return currentRefreshRequest.pipe(
        switchMap(refreshed => {
          if (!refreshed) {
            auth.clearCurrentUser();
            void router.navigateByUrl(loginUrl);
            return throwError(() => error);
          }

          return next(req);
        }),
        catchError(refreshError => {
          auth.clearCurrentUser();
          void router.navigateByUrl(loginUrl);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
