import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { getApiErrorMessage } from '../api/api-error';
import { AuthService } from '../services/auth/auth.service';
import { NotificationService } from '../services/ui/notification.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status !== 401 && error.status !== 403) {
        return throwError(() => error);
      }

      const isAuthEndpoint = /\/v1\/auth\/(login|register|logout|profile|refresh)(\?|$)/i.test(req.url);
      const message = getApiErrorMessage(
        error,
        error.status === 401
          ? 'Authentication is required.'
          : 'You do not have permission to perform this action.',
      );

      if (error.status === 401) {
        authService.clearCurrentUser();

        if (!isAuthEndpoint) {
          notification.error(message);
          void router.navigate(['/login']);
        }
      } else if (!isAuthEndpoint) {
        notification.error(message);
      }

      return throwError(() => error);
    }),
  );
};
