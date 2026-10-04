import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
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
