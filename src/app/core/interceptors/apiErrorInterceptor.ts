import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { getApiErrorMessage } from '../api/api-error';
import { AuthService } from '../services/auth/auth.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        const message = getApiErrorMessage(
          error,
          error.status === 401 ? 'Authentication is required.' : 'You do not have permission to perform this action.',
        );

        authService.clearCurrentUser();

        const isAuthEndpoint = /\/(login|register|logout|profile)(\?|$)/i.test(req.url);
        if (!isAuthEndpoint) {
          toastr.error(message);
        }

        if (error.status === 401 && !isAuthEndpoint) {
          void router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    }),
  );
};
