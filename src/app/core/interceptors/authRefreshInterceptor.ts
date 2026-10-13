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

// "Who am I?" probe (bootstrap app initializer, route guards, public pages).
// A 401 here only means "nobody is signed in" — public routes such as the
// invitation page and the public event website must be able to render it.
// The route guards already redirect the routes that really need a session.
const SESSION_PROBE = /\/v1\/auth\/profile(\?|$)/i;

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isAuthRequest = /\/v1\/auth\/(login|register|refresh|logout)/i.test(req.url);

  // Where the user actually is (or is heading to).
  //
  // `Router.url` returns the committed `currentUrlTree`, which is only written
  // at `BeforeActivateRoutes` — i.e. at the END of a navigation. The very first
  // navigation is started by an APP_BOOTSTRAP_LISTENER, which runs after the
  // app initializers, and `provideAppInitializer` in app.config.ts blocks
  // bootstrap until `loadCurrentUser()` (the profile probe) completes. A 401
  // from that probe therefore always saw `router.url === '/'` and built
  // `/login?returnUrl=%2F`, hijacking deep links such as
  // `/photographer-invitation/{token}` before AcceptInvitation could set the
  // event specific return URL. The login URL is now built at redirect time,
  // from the URL the router is actually heading to.
  function returnTargetUrl(): string | null {
    const inFlight = router.getCurrentNavigation();
    if (inFlight) {
      return router.serializeUrl(inFlight.finalUrl ?? inFlight.extractedUrl);
    }
    return router.navigated ? router.url : null;
  }

  function redirectToLogin(): void {
    if (SESSION_PROBE.test(req.url)) return;

    const returnUrl = returnTargetUrl();

    // Nothing committed yet (bootstrap): the route guards redirect with
    // `state.url` as soon as the first navigation runs.
    if (returnUrl === null) return;

    // Already on /login: navigating again would drop the returnUrl (and email)
    // that the invitation flow preserved there.
    if (returnUrl === '/login' || returnUrl.startsWith('/login?')) return;

    void router.navigateByUrl(
      returnUrl === '/'
        ? router.createUrlTree(['/login'])
        : router.createUrlTree(['/login'], { queryParams: { returnUrl } }),
    );
  }

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

      return currentRefreshRequest.pipe(
        switchMap(refreshed => {
          if (!refreshed) {
            auth.clearCurrentUser();
            redirectToLogin();
            return throwError(() => error);
          }

          return next(req);
        }),
        catchError(refreshError => {
          auth.clearCurrentUser();
          redirectToLogin();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
